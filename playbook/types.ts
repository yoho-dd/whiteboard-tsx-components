import type { WBDocument } from '@larksuite/whiteboard-cli/auto-layout-dsl/types';

export type MaybePromise<T> = T | Promise<T>;

export type PlaybookStory = {
  /** Stable id used for filenames/URLs (defaults to the story filename). */
  id?: string;
  /** Category shown in the playbook sidebar. */
  category?: string;
  title: string;
  description?: string;
  render: () => MaybePromise<WBDocument>;
};
