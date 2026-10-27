import { centsToInput, parseReais } from "@/lib/money";

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

export type ImportVariant = {
  cor: string | null;
  cor_hex: string | null;
  tamanho: string | null;
  estoque: number;
  preco_centavos: number | null;
  /** Preenchido só quando este tamanho tem preço diferente do produto. */
  precoTexto: string | null;
};
export type ImportProduct = {
  id: string;
  nome: string;
  /** O que veio na célula de preço, para a pessoa corrigir na tela. */
  precoTexto: string;
  descricao: string;
  preco_centavos: number;
  preco_de_centavos: number | null;
  categoria: string;
  destaque: boolean;
  fotos: string[];
  /** Fotos que estavam dentro da planilha, na linha deste produto. */
  arquivos: File[];
  variacoes: ImportVariant[];
  aviso: string | null;
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
  item: "nome",
  peca: "nome",
  titulo: "nome",
  produto_nome: "nome",
  descricao: "descricao",
  descricao_produto: "descricao",
  detalhe: "descricao",
  detalhes: "descricao",
  valor: "preco",
  preco_venda: "preco",
  preco_de_venda: "preco",
  valor_venda: "preco",
  valor_unitario: "preco",
  vlr: "preco",
  preco_unitario: "preco",
  preco_de: "preco_anterior",
  preco_antigo: "preco_anterior",
  imagens: "fotos",
  foto: "fotos",
  imagem: "fotos",
  cor_hexadecimal: "cor_hex",
  cores: "cor",
  tamanhos: "tamanho",
  tam: "tamanho",
  quantidade: "estoque",
  qtd: "estoque",
  qtde: "estoque",
  qtd_estoque: "estoque",
};

/** O que ainda impede este produto de ir para a loja. */
export function productIssues(product: ImportProduct) {
  const issues: string[] = [];
  if (product.nome.trim().length < 2) issues.push("Informe o nome com pelo menos 2 letras.");
  if ((parseReais(product.precoTexto) ?? 0) <= 0) issues.push("Informe o preço. Exemplo: 49,90.");
  return issues;
}

function pieces(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/\s*(?:\/|\||,|;)\s*/).map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(0, 12) : [trimmed];
}

function addVariant(product: ImportProduct, variant: ImportVariant) {
  const same = product.variacoes.find((item) => item.cor === variant.cor && item.tamanho === variant.tamanho);
  if (same) {
    same.estoque += variant.estoque;
    if (same.precoTexto == null) {
      same.preco_centavos = variant.preco_centavos;
      same.precoTexto = variant.precoTexto;
    }
    return;
  }
  if (product.variacoes.length >= 40) {
    product.aviso = "Muitas combinações de cor e tamanho. Ficaram as 40 primeiras. Ajuste abaixo.";
    return;
  }
  product.variacoes.push(variant);
}

function draftProduct(id: string, nome: string, priceRaw: string, get: (column: string) => string): ImportProduct {
  const price = parseReais(priceRaw);
  const cents = price != null && price > 0 ? price : 0;
  const compareRaw = get("preco_anterior");
  const compare = compareRaw ? parseReais(compareRaw) : null;
  return {
    id,
    nome: nome.slice(0, 120),
    precoTexto: cents > 0 ? centsToInput(cents) : priceRaw.trim(),
    descricao: get("descricao"),
    preco_centavos: cents,
    preco_de_centavos: compare && cents > 0 && compare > cents ? compare : null,
    categoria: get("categoria") || "Geral",
    destaque: /^(sim|s|1|true|x)$/i.test(get("destaque")),
    fotos: [],
    arquivos: [],
    variacoes: [],
    aviso: null,
  };
}

function fillProduct(product: ImportProduct, get: (column: string) => string, priceCents: number | null) {
  if (!product.descricao && get("descricao")) product.descricao = get("descricao");
  if (product.categoria === "Geral" && get("categoria")) product.categoria = get("categoria");
  if (!product.destaque && /^(sim|s|1|true|x)$/i.test(get("destaque"))) product.destaque = true;
  for (const url of get("fotos").split(/[|\n]/).map((item) => item.trim()).filter((item) => /^https:\/\/\S+$/i.test(item))) {
    if (product.fotos.length >= 10 || product.fotos.includes(url)) continue;
    product.fotos.push(url);
  }
  if (product.preco_centavos <= 0 && priceCents && !product.precoTexto.trim()) {
    product.preco_centavos = priceCents;
    product.precoTexto = centsToInput(priceCents);
    const compare = get("preco_anterior") ? parseReais(get("preco_anterior")) : null;
    if (compare && compare > priceCents) product.preco_de_centavos = compare;
  }

  const cores = pieces(get("cor"));
  const tamanhos = pieces(get("tamanho"));
  const hex = get("cor_hex");
  const corHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : null;
  const estoque = Math.max(0, Math.floor(Number(get("estoque").replace(",", ".")) || 0));
  const variantPrice = priceCents != null && priceCents !== product.preco_centavos ? priceCents : null;
  const variantPriceText = variantPrice != null ? centsToInput(variantPrice) : null;
  const colors = cores.length ? cores : [null];
  const sizes = tamanhos.length ? tamanhos : [null];
  if (!colors[0] && !sizes[0]) {
    if (estoque > 0) addVariant(product, { cor: null, cor_hex: null, tamanho: null, estoque, preco_centavos: null, precoTexto: null });
    return;
  }
  for (const cor of colors) {
    for (const tamanho of sizes) {
      addVariant(product, {
        cor,
        tamanho,
        cor_hex: cores.length === 1 ? corHex : null,
        estoque,
        preco_centavos: variantPrice,
        precoTexto: variantPriceText,
      });
    }
  }
}

export function buildImport(text: string, imagesByLine?: Map<number, File[]>): ImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return {
      products: [],
      errors: ["A planilha não tem produtos. A primeira linha é o título (nome, preço, tamanho) e cada linha seguinte é um produto."],
    };
  }
  const header = rows[0].map((cell) => {
    const key = normalizeHeader(cell);
    return (CSV_COLUMNS as readonly string[]).includes(key) ? key : (ALIASES[key] ?? key);
  });
  const errors: string[] = [];
  if (!header.includes("nome")) {
    header[0] = "nome";
    errors.push("A primeira coluna entrou como nome. Confira os produtos marcados e ajuste o nome aqui.");
  }
  if (!header.includes("preco")) {
    errors.push("Não achamos a coluna de preço. Informe o preço nos produtos marcados. Exemplo: 49,90.");
  }

  const products: ImportProduct[] = [];
  const byName = new Map<string, ImportProduct>();
  let previous: ImportProduct | null = null;
  rows.slice(1).forEach((cells, rowIndex) => {
    const line = rowIndex + 2;
    const get = (column: string) => (cells[header.indexOf(column)] ?? "").trim();
    const nome = get("nome");
    const priceRaw = header.includes("preco") ? get("preco") : "";
    const price = parseReais(priceRaw);
    const cents = price != null && price > 0 ? price : null;

    let product = nome ? byName.get(nome.toLowerCase()) : previous;
    if (!product || (!nome && !previous)) {
      product = draftProduct(`linha-${line}`, nome, priceRaw, get);
      products.push(product);
      if (nome) byName.set(nome.toLowerCase(), product);
    } else if (product.preco_centavos <= 0 && cents && !product.precoTexto.trim()) {
      product.preco_centavos = cents;
      product.precoTexto = centsToInput(cents);
    }
    previous = product;

    for (const file of imagesByLine?.get(line) ?? []) {
      if (product.arquivos.length >= 10) break;
      if (product.arquivos.some((item) => item.name === file.name && item.size === file.size)) continue;
      product.arquivos.push(file);
    }
    fillProduct(product, get, cents);
  });

  return { products, errors };
}
