import { useCallback, useContext } from 'react';
import { loadFiles } from '../../lib/ddc/files';
import { unwrap } from '../../lib/unwrap';
import { convertTags, File } from '../../file';
import { AppContext } from '../../app-context';

export function useLoadFiles() {
  const { client, bucket, path, setFiles } = useContext(AppContext);
  return useCallback(async () => {
    const pieces = await loadFiles(unwrap(client), bucket, path);
    const loadedFiles = pieces
      .filter((piece) => convertTags(piece.tags).some((t) => t.key === 'Path' && t.value === path))
      .map((piece) => {
        const tags = convertTags(piece.tags);
        return new File(
          tags.find((tag) => tag.key === 'Name')?.value || '--',
          tags.find((tag) => tag.key === 'Type')?.value || '--',
          tags.find((tag) => tag.key === 'Size')?.value || '',
          tags.find((tag) => tag.key === 'Date added')?.value || '--',
          tags.find((t) => t.key === 'Kind')?.value === 'File' ? piece.cid : '',
        );
      });
    setFiles(loadedFiles);
  }, [bucket, client, path, setFiles]);
}
