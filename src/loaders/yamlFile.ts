import type { Loader, LoaderContext } from 'astro/loaders';
import { parse } from 'yaml';
import { readFile } from 'node:fs/promises';

interface YAMLFileLoaderOptions {
  /** Treat the whole document as one entry whose data is the parsed YAML object. */
  single?: boolean;
  /** Field used as the entry id when the document is an array of records. Defaults to `id`. */
  idField?: string;
}

/**
 * Loader for YAML data files with full control over entry ids.
 *
 * - Arrays become one entry per item (`id` field, else `slug`, else an index).
 * - A top-level object becomes one entry per key.
 * - With `single: true`, the whole document becomes a single entry named `main`.
 *
 * Unlike Astro's built-in `file()` loader, this keeps YAML scalar dates as
 * strings and does not require an `id`/`slug` on every item.
 */
export function yamlFile(filePath: string, options: YAMLFileLoaderOptions = {}): Loader {
  const { single = false, idField = 'id' } = options;

  return {
    name: 'yaml-file',
    load: async (context: LoaderContext): Promise<void> => {
      const { store, config } = context;
      const fileUrl = new URL(filePath, config.root);
      const text = await readFile(fileUrl, 'utf8');
      const doc = parse(text);

      if (single) {
        const data = doc ?? {};
        await context.parseData({ id: 'main', data, filePath: fileUrl.href });
        store.set({ id: 'main', data, filePath: fileUrl.href });
        return;
      }

      if (Array.isArray(doc)) {
        let index = 0;
        for (const item of doc) {
          const fallbackId = `item-${index}`;
          const record = item as Record<string, unknown>;
          const id = String(record?.[idField] ?? record?.slug ?? fallbackId);
          const data = record ?? (item as Record<string, unknown>);
          await context.parseData({ id, data, filePath: fileUrl.href });
          store.set({ id, data, filePath: fileUrl.href });
          index += 1;
        }
        return;
      }

      if (doc && typeof doc === 'object') {
        for (const [key, value] of Object.entries(doc)) {
          const data = value as Record<string, unknown>;
          await context.parseData({ id: key, data, filePath: fileUrl.href });
          store.set({ id: key, data, filePath: fileUrl.href });
        }
      }
    },
  };
}