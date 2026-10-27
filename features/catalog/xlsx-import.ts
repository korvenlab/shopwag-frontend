import { strFromU8, unzipSync } from "fflate";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export type XlsxRead = { csv: string; imagesByLine: Map<number, File[]>; notes: string[] };

const READ_ERROR = "Não conseguimos ler essa planilha. Salve de novo como Excel (.xlsx).";

/** Lê a primeira aba e as fotos presas a cada linha: sobre a célula ou dentro dela. */
export function readXlsx(buffer: ArrayBuffer): XlsxRead {
  let packed: Record<string, Uint8Array>;
  try {
    packed = unzipSync(new Uint8Array(buffer));
  } catch {
    throw new Error(READ_ERROR);
  }
  const files = new Map<string, Uint8Array>();
  for (const [path, bytes] of Object.entries(packed)) files.set(path.replace(/^\/+/, "").toLowerCase(), bytes);

  const workbook = xml(files, "xl/workbook.xml");
  const workbookRels = relationships(xml(files, "xl/_rels/workbook.xml.rels"));
  const sheet = [...workbook.getElementsByTagNameNS("*", "sheet")][0];
  const sheetRid = sheet ? attr(sheet, "id") : null;
  const sheetTarget = workbookRels.find((rel) => rel.id === sheetRid)?.target;
  if (!sheetTarget) throw new Error(READ_ERROR);
  const sheetPath = resolvePath("xl/workbook.xml", sheetTarget);
  const sheetXml = xml(files, sheetPath);
  const strings = sharedStrings(files);

  const cells = sheetCells(sheetXml, strings);
  const byRow = new Map<number, Map<number, string>>();
  for (const cell of cells) {
    const row = byRow.get(cell.row) ?? new Map<number, string>();
    row.set(cell.col, cell.text);
    byRow.set(cell.row, row);
  }
  const keptRows = [...byRow.keys()]
    .filter((row) => [...(byRow.get(row)?.values() ?? [])].some((value) => value.trim()))
    .sort((a, b) => a - b);
  const lineByRow = new Map(keptRows.map((row, index) => [row, index + 1]));
  const width = Math.max(0, ...keptRows.map((row) => Math.max(-1, ...(byRow.get(row)?.keys() ?? [])) + 1));
  const csv = keptRows
    .map((row) =>
      Array.from({ length: width }, (_, col) => csvCell(byRow.get(row)?.get(col) ?? "")).join(";"),
    )
    .join("\n");

  const notes: string[] = [];
  let tooBig = 0;
  let unsupported = 0;
  const placed: Array<{ line: number; col: number; file: File }> = [];

  const remember = (line: number | undefined, col: number, mediaPath: string) => {
    if (!line || line <= 1) return;
    const bytes = files.get(mediaPath.toLowerCase());
    if (!bytes) return;
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      tooBig += 1;
      return;
    }
    const kind = imageKind(bytes, mediaPath);
    if (!kind) {
      unsupported += 1;
      return;
    }
    const name = mediaPath.split("/").pop() || `foto.${kind.ext}`;
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    placed.push({ line, col, file: new File([copy], name, { type: kind.type }) });
  };

  const sheetRels = optionalXml(files, relsPath(sheetPath));
  for (const rel of sheetRels ? relationships(sheetRels) : []) {
    if (!rel.type.includes("/drawing")) continue;
    const drawingPath = resolvePath(sheetPath, rel.target);
    const drawing = optionalXml(files, drawingPath);
    if (!drawing) continue;
    const drawingRels = relationships(optionalXml(files, relsPath(drawingPath)) ?? emptyXml());
    for (const anchor of anchors(drawing)) {
      const media = drawingRels.find((item) => item.id === anchor.embed)?.target;
      if (!media) continue;
      const line = lineBetween(lineByRow, anchor.row, anchor.rowEnd);
      remember(line, anchor.col, resolvePath(drawingPath, media));
    }
  }

  const imageIds = cellImageIndex(files);
  for (const cell of cells) {
    const id = dispImgId(`${cell.formula}\n${cell.text}`);
    const media = id ? imageIds.get(id) : undefined;
    if (media) remember(lineByRow.get(cell.row), cell.col, media);
  }

  if (tooBig) notes.push(tooBig === 1 ? "1 foto da planilha passa de 3 MB e não entrou." : `${tooBig} fotos da planilha passam de 3 MB e não entraram.`);
  if (unsupported) {
    notes.push(
      unsupported === 1
        ? "1 foto da planilha está num formato que não abrimos. Use PNG, JPG ou WEBP."
        : `${unsupported} fotos da planilha estão num formato que não abrimos. Use PNG, JPG ou WEBP.`,
    );
  }

  const imagesByLine = new Map<number, File[]>();
  placed
    .sort((a, b) => a.line - b.line || a.col - b.col)
    .forEach((item) => {
      const list = imagesByLine.get(item.line) ?? [];
      list.push(item.file);
      imagesByLine.set(item.line, list);
    });
  return { csv, imagesByLine, notes };
}

function lineBetween(lineByRow: Map<number, number>, fromRow: number, toRow: number) {
  const start = Math.min(fromRow, toRow);
  const end = Math.max(fromRow, toRow);
  for (let row = start; row <= end; row += 1) {
    const line = lineByRow.get(row);
    if (line && line > 1) return line;
  }
  return undefined;
}

/** Fotos do WPS e do Excel colocadas dentro da célula: a célula cita o id e o xml aponta o arquivo. */
function cellImageIndex(files: Map<string, Uint8Array>) {
  const index = new Map<string, string>();
  const listing = optionalXml(files, "xl/cellimages.xml");
  if (!listing) return index;
  const rels = relationships(optionalXml(files, "xl/_rels/cellimages.xml.rels") ?? emptyXml());
  for (const pic of listing.getElementsByTagNameNS("*", "pic")) {
    const name = attr(pic.getElementsByTagNameNS("*", "cNvPr")[0], "name");
    const embed = attr(pic.getElementsByTagNameNS("*", "blip")[0], "embed");
    const target = rels.find((rel) => rel.id === embed)?.target;
    if (name && target) index.set(name, resolvePath("xl/cellimages.xml", target));
  }
  return index;
}

function dispImgId(value: string) {
  return value.match(/DISPIMG\(\s*"([^"]+)"/i)?.[1] ?? null;
}

type Anchor = { row: number; rowEnd: number; col: number; embed: string };

function anchors(doc: Document): Anchor[] {
  const found: Anchor[] = [];
  for (const name of ["twoCellAnchor", "oneCellAnchor"]) {
    for (const anchor of doc.getElementsByTagNameNS("*", name)) {
      const from = child(anchor, "from");
      const blip = anchor.getElementsByTagNameNS("*", "blip")[0];
      const embed = attr(blip, "embed");
      if (!from || !embed) continue;
      const row = Number(childText(from, "row"));
      const col = Number(childText(from, "col"));
      const to = child(anchor, "to");
      const rowEnd = to ? Number(childText(to, "row")) : row;
      if (!Number.isFinite(row) || !Number.isFinite(col)) continue;
      found.push({ row: row + 1, rowEnd: (Number.isFinite(rowEnd) ? rowEnd : row) + 1, col, embed });
    }
  }
  return found;
}

type SheetCell = { row: number; col: number; text: string; formula: string };

function sheetCells(doc: Document, strings: string[]): SheetCell[] {
  const cells: SheetCell[] = [];
  for (const cell of doc.getElementsByTagNameNS("*", "c")) {
    const ref = attr(cell, "r");
    if (!ref) continue;
    const row = Number(ref.replace(/[A-Za-z]+/g, ""));
    const col = columnIndex(ref);
    if (!row || col < 0) continue;
    const type = attr(cell, "t");
    const formula = childText(cell, "f");
    const raw = childText(cell, "v");
    let text = "";
    if (type === "s") text = strings[Number(raw)] ?? "";
    else if (type === "inlineStr") text = [...cell.getElementsByTagNameNS("*", "t")].map((node) => node.textContent ?? "").join("");
    else if (type === "b") text = raw === "1" ? "sim" : "";
    else text = raw;
    const imageId = dispImgId(`${formula}\n${text}`);
    if (imageId) text = "";
    cells.push({ row, col, text: text.trim(), formula: imageId ? `DISPIMG("${imageId}")` : formula });
  }
  return cells;
}

function sharedStrings(files: Map<string, Uint8Array>) {
  const doc = optionalXml(files, "xl/sharedstrings.xml");
  if (!doc) return [];
  return [...doc.getElementsByTagNameNS("*", "si")].map((item) => {
    const direct = [...item.children].filter((node) => node.localName === "t");
    const nodes = direct.length ? direct : [...item.getElementsByTagNameNS("*", "t")].filter((node) => node.parentElement?.localName !== "rPh");
    return nodes.map((node) => node.textContent ?? "").join("");
  });
}

function columnIndex(ref: string) {
  const letters = ref.replace(/[0-9]/g, "").toUpperCase();
  let index = 0;
  for (const char of letters) index = index * 26 + char.charCodeAt(0) - 64;
  return index - 1;
}

function imageKind(bytes: Uint8Array, path: string) {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { ext: "png", type: "image/png" };
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) return { ext: "webp", type: "image/webp" };
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png") return { ext, type: "image/png" };
  if (ext === "jpg" || ext === "jpeg") return { ext: "jpg", type: "image/jpeg" };
  if (ext === "webp") return { ext, type: "image/webp" };
  return null;
}

function csvCell(value: string) {
  return /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function relationships(doc: Document) {
  return [...doc.getElementsByTagNameNS("*", "Relationship")]
    .map((rel) => ({ id: attr(rel, "Id") ?? "", target: attr(rel, "Target") ?? "", type: attr(rel, "Type") ?? "", external: attr(rel, "TargetMode") === "External" }))
    .filter((rel) => rel.id && rel.target && !rel.external);
}

function relsPath(filePath: string) {
  const parts = filePath.split("/");
  const name = parts.pop() ?? "";
  return [...parts, "_rels", `${name}.rels`].join("/");
}

function resolvePath(fromFile: string, target: string) {
  if (target.startsWith("/")) return target.replace(/^\/+/, "");
  const parts = fromFile.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  return parts.join("/");
}

function xml(files: Map<string, Uint8Array>, path: string) {
  const doc = optionalXml(files, path);
  if (!doc) throw new Error(READ_ERROR);
  return doc;
}

function optionalXml(files: Map<string, Uint8Array>, path: string) {
  const bytes = files.get(path.toLowerCase());
  if (!bytes) return null;
  const doc = new DOMParser().parseFromString(strFromU8(bytes), "application/xml");
  if ([...doc.childNodes].some((node) => node.nodeName === "parsererror")) throw new Error(READ_ERROR);
  return doc;
}

function emptyXml() {
  return new DOMParser().parseFromString("<r/>", "application/xml");
}

function child(element: Element, name: string) {
  return [...element.children].find((node) => node.localName === name) ?? null;
}

function childText(element: Element | null, name: string) {
  if (!element) return "";
  const node = [...element.children].find((item) => item.localName === name) ?? element.getElementsByTagNameNS("*", name)[0];
  return node?.textContent?.trim() ?? "";
}

function attr(element: Element | undefined | null, name: string) {
  if (!element) return null;
  for (const attribute of element.attributes) if (attribute.localName === name) return attribute.value;
  return null;
}
