import { Directory, File, Paths } from 'expo-file-system';

import type { ExportDispatchAdapter } from '@/services/insights/dispatchExportRequest';

function createExportsDirectory(): Directory {
  return new Directory(Paths.document, 'pocketpilot', 'exports');
}

export const defaultInsightsExportDispatchAdapter: ExportDispatchAdapter = {
  dispatchSupported: true,
  canShare: false,
  async writeFile(params) {
    const directory = createExportsDirectory();
    const file = new File(directory, params.fileLabel);

    directory.create({
      idempotent: true,
      intermediates: true,
    });
    file.create({
      intermediates: true,
      overwrite: true,
    });
    file.write(params.content);
  },
};
