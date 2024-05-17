
module.exports = `
  type MdxFields {
    slug: String
  }
  type MdxFrontmatter {
    templateKey: String
    title: String
    userRequirement: String
  }
  type Mdx {
    frontmatter: MdxFrontmatter
    fields: MdxFields
  }
`;
