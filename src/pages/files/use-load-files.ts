import { useCallback, useContext } from 'react';
import { buildPath, loadFiles } from '../../lib/ddc/files';
import { unwrap } from '../../lib/unwrap';
import { File as DdcFile } from '../../file';
import { AppContext } from '../../app-context';

export function useLoadFiles() {
  const { client, bucket, path, setFiles } = useContext(AppContext);
  return useCallback(async () => {
    const pieces = await loadFiles(unwrap(client), bucket, path);
    const resultPath = buildPath(path);
    const loadedFiles = pieces
      .filter((piece) => piece.tags.some((t) => t.key === 'path' && t.value === resultPath))
      .map((piece) => {
        const { tags } = piece;
        return new DdcFile(
          tags.find((tag) => tag.key === 'name')?.value?.toString() || '--',
          tags.find((tag) => tag.key === 'kind')?.value?.toString() || '--',
          tags.find((tag) => tag.key === 'size')?.value?.toString() || '',
          tags.find((tag) => tag.key === 'timestamp')?.value?.toString() || '--',
          tags.find((t) => t.key === 'kind')?.value === 'file' ? piece.cid : '',
        );
      });
    setFiles(loadedFiles);
  }, [bucket, client, path, setFiles]);
}
