import { CategoryDto } from '../../models/api.types';

export function findCategoryPath(roots: CategoryDto[], slug: string): CategoryDto[] | null {
  for (const node of roots) {
    if (node.slug === slug) {
      return [node];
    }
    const childPath = findCategoryPath(node.children ?? [], slug);
    if (childPath) {
      return [node, ...childPath];
    }
  }
  return null;
}

export function categoryDescendantSlugs(node: CategoryDto): string[] {
  const own = [node.slug];
  const fromChildren = (node.children ?? []).flatMap(categoryDescendantSlugs);
  return [...own, ...fromChildren];
}
