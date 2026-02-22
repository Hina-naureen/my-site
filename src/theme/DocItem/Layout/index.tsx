/**
 * Docusaurus swizzle wrapper for DocItem/Layout.
 * Injects the ChapterControls toolbar at the top of every documentation page.
 *
 * @see https://docusaurus.io/docs/swizzling#wrapping
 */
import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import ChapterControls from '@site/src/components/chapter/ChapterControls';
import UrduTranslator from '@site/src/components/UrduTranslator';
import TranslationSkeleton from '@site/src/components/TranslationSkeleton';

type Props = WrapperProps<typeof DocItemLayoutType>;

export default function DocItemLayoutWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <ChapterControls />
      <UrduTranslator />
      <TranslationSkeleton />
      <DocItemLayout {...props} />
    </>
  );
}
