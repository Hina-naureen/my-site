/**
 * Extends Docusaurus's built-in navbar item types with our custom auth item.
 * Swizzle (wrap) of @theme/NavbarItem/ComponentTypes.
 */
import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import AuthNavbarItem from '@site/src/components/auth/AuthNavbarItem';

export default {
  ...OriginalComponentTypes,
  'custom-AuthNavbarItem': AuthNavbarItem,
} as typeof OriginalComponentTypes & { 'custom-AuthNavbarItem': typeof AuthNavbarItem };
