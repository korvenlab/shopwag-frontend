import { parseReais } from "@/lib/money";

export const CSV_COLUMNS = [
  "nome",
  "descricao",
  "preco",
  "preco_anterior",
  "categoria",
  "destaque",
  "fotos",
  "cor",
  "cor_hex",
  "tamanho",
  "estoque",
] as const;

export const CSV_TEMPLATE = [
  CSV_COLUMNS.join(";"),
  'Vestido Midi Linho;"Vestido leve, ótimo para o verão";189,90;249,90;Vestidos;sim;https://exemplo.com/foto1.jpg|https://exemplo.com/foto2.jpg;Areia;#d8c7a8;P;3',
  "Vestido Midi Linho;;;;;;;Areia;#d8c7a8;M;5",
  "Vestido Midi Linho;;;;;;;Preto;#111111;M;2",
  "Bolsa de Palha;Feita à mão;129,00;;Acessórios;não;https://exemplo.com/bolsa.jpg;;;;",
].join("\n");

export type ImportVariant = { cor: string | null; cor_hex: string | null; tamanho: string | null; estoque: number };
export type ImportProduct = {
  nome: string;
  descricao: string;
  preco_centavos: number;
  preco_de_centavos: number | null;
  categoria: string;
  destaque: boolean;
  fotos: string[];
  /** Fotos que estavam dentro da planilha, na linha deste produto. */
  arquivos: File[];
  variacoes: ImportVariant[];
};
export type ImportResult = { products: ImportProduct[]; errors: string[] };

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/** Nome do arquivo sem extensão, sem acentos e em minúsculas, para casar com o produto. */
export function photoKey(value: string) {
  return value
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type PhotoMatch = { matched: Map<string, File[]>; unused: string[] };

/** Casa cada foto com o produto de mesmo nome. "Vestido Linho 2.jpg" é a segunda foto do Vestido Linho. */
export function matchPhotos(products: ImportProduct[], files: File[]): PhotoMatch {
  const matched = new Map<string, File[]>();
  const unused: string[] = [];
  const groups = new Map<string, Array<{ file: File; order: number }>>();
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      unused.push(file.name);
      continue;
    }
    const key = photoKey(file.name);
    const numbered = key.match(/^(.*?) (\d+)$/);
    const base = numbered ? numbered[1] : key;
    const order = numbered ? Number(numbered[2]) : 0;
    const group = groups.get(base) ?? [];
    group.push({ file, order });
    groups.set(base, group);
  }
  const used = new Set<string>();
  for (const product of products) {
    const group = groups.get(photoKey(product.nome));
    if (!group) continue;
    used.add(photoKey(product.nome));
    matched.set(
      product.nome.toLowerCase(),
      group.sort((a, b) => a.order - b.order).slice(0, 10).map((item) => item.file),
    );
  }
  for (const [base, group] of groups) {
    if (!used.has(base)) group.forEach((item) => unused.push(item.file.name));
  }
  return { matched, unused };
}

function detectDelimiter(header: string) {
  const counts = [";", ",", "\t"].map((delimiter) => [delimiter, header.split(delimiter).length] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

/** CSV com aspas, aspas duplicadas e quebras de linha dentro de campos. */
export function parseCsv(text: string) {
  const clean = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(clean.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    if (quoted) {
      if (char === '"' && clean[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && clean[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALIASES: Record<string, (typeof CSV_COLUMNS)[number]> = {
  produto: "nome",
  titulo: "nome",
  descricao: "descricao",
  valor: "preco",
  preco_de: "preco_anterior",
  preco_antigo: "preco_anterior",
  imagens: "fotos",
  foto: "fotos",
  cor_hexadecimal: "cor_hex",
  quantidade: "estoque",
};

export function buildImport(text: string, imagesByLine?: Map<number, File[]>): ImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { products: [], errors: ["A planilha está vazia ou sem a linha de títulos."] };
  const header = rows[0].map((cell) => {
    const key = normalizeHeader(cell);
    return (CSV_COLUMNS as readonly string[]).includes(key) ? key : (ALIASES[key] ?? key);
  });
  if (!header.includes("nome") || !header.includes("preco")) {
    return { products: [], errors: ["A planilha precisa ter as colunas nome e preco. Baixe o modelo para conferir."] };
  }

  const errors: string[] = [];
  const byName = new Map<string, ImportProduct>();
  rows.slice(1).forEach((cells, rowIndex) => {
    const line = rowIndex + 2;
    const get = (column: string) => (cells[header.indexOf(column)] ?? "").trim();
    const nome = get("nome");
    if (!nome) {
      errors.push(`Linha ${line}: falta o nome do produto.`);
      return;
    }
    const key = nome.toLowerCase();
    let product = byName.get(key);
    if (!product) {
      const price = parseReais(get("preco"));
      if (price == null || price <= 0) {
        errors.push(`Linha ${line}: preço inválido para “${nome}”.`);
        return;
      }
      const compare = get("preco_anterior") ? parseReais(get("preco_anterior")) : null;
      product = {
        nome: nome.slice(0, 120),
        descricao: get("descricao"),
        preco_centavos: price,
        preco_de_centavos: compare && compare > price ? compare : null,
        categoria: get("categoria") || "Geral",
        destaque: /^(sim|s|1|true|x)$/i.test(get("destaque")),
        fotos: get("fotos")
          .split(/[|\n]/)
          .map((url) => url.trim())
          .filter((url) => /^https:\/\/\S+$/i.test(url))
          .slice(0, 10),
        arquivos: [],
        variacoes: [],
      };
      byName.set(key, product);
    }
    for (const file of imagesByLine?.get(line) ?? []) {
      if (product.arquivos.length >= 10) break;
      if (product.arquivos.some((item) => item.name === file.name && item.size === file.size)) continue;
      product.arquivos.push(file);
    }
    const cor = get("cor") || null;
    const tamanho = get("tamanho") || null;
    if (cor || tamanho) {
      const hex = get("cor_hex");
      product.variacoes.push({
        cor,
        tamanho,
        cor_hex: /^#[0-9a-f]{6}$/i.test(hex) ? hex : null,
        estoque: Math.max(0, Math.floor(Number(get("estoque").replace(",", ".")) || 0)),
      });
    }
  });

  return { products: [...byName.values()], errors };
}
