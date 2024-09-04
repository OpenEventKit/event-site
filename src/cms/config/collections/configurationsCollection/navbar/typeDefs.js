
module.exports = `
  type NavbarItem {
    title: String
    link: String
    display: Boolean
    userRequirement: String
    pageRestriction: [String]
    showOnlyAtShowTime: Boolean
  }

  type NavbarJson implements Node {
    items: [NavbarItem]
  }
`;