import { ParseTreeNode } from "@/types/corenlp";

/**
 * Tokenize Penn Treebank formatted string into tokens: '(', ')', or labels/words.
 */
function tokenizePennTree(raw: string): string[] {
  const tokens: string[] = [];
  let current = "";

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (char === "(" || char === ")") {
      if (current.trim()) {
        tokens.push(current.trim());
        current = "";
      }
      tokens.push(char);
    } else if (/\s/.test(char)) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
}

/**
 * Convert Penn Treebank bracket string into a structured tree of ParseTreeNodes.
 */
export function parsePennTreebank(treeString: string): ParseTreeNode | null {
  if (!treeString || typeof treeString !== "string") return null;

  const tokens = tokenizePennTree(treeString.trim());
  let index = 0;
  let nodeIdCounter = 0;

  function parseSubtree(depth = 0): ParseTreeNode | null {
    if (index >= tokens.length) return null;

    if (tokens[index] !== "(") {
      index++;
      return null;
    }

    index++; // consume '('
    if (index >= tokens.length) return null;

    const label = tokens[index++];
    const children: ParseTreeNode[] = [];
    let word: string | undefined = undefined;

    while (index < tokens.length && tokens[index] !== ")") {
      if (tokens[index] === "(") {
        const child = parseSubtree(depth + 1);
        if (child) children.push(child);
      } else {
        // Leaf word
        word = tokens[index++];
      }
    }

    if (index < tokens.length && tokens[index] === ")") {
      index++; // consume ')'
    }

    const node: ParseTreeNode = {
      id: `node-${nodeIdCounter++}`,
      label,
      children,
      depth,
      ...(word ? { word, pos: label } : {}),
    };

    return node;
  }

  return parseSubtree(0);
}
