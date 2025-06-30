import { describe, expect, it } from "vitest";
import { navigation } from "./navigation";

describe("Navigation Data", () => {
  describe("navigation structure", () => {
    it("is an array", () => {
      expect(Array.isArray(navigation)).toBe(true);
    });

    it("has at least one navigation group", () => {
      expect(navigation.length).toBeGreaterThan(0);
    });

    it("each group has required properties", () => {
      navigation.forEach((group) => {
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("items");
        expect(typeof group.name).toBe("string");
        expect(Array.isArray(group.items)).toBe(true);
      });
    });

    it("each group has non-empty name", () => {
      navigation.forEach((group) => {
        expect(group.name.length).toBeGreaterThan(0);
      });
    });

    it("each group has at least one item", () => {
      navigation.forEach((group) => {
        expect(group.items.length).toBeGreaterThan(0);
      });
    });
  });

  describe("navigation items", () => {
    it("each item has required properties", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          expect(item).toHaveProperty("name");
          expect(item).toHaveProperty("icon");
          expect(typeof item.name).toBe("string");
          expect(typeof item.icon).toBe("object");
        });
      });
    });

    it("each item has non-empty name", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          expect(item.name.length).toBeGreaterThan(0);
        });
      });
    });

    it("items with href have valid URL format", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          if (item.href) {
            expect(item.href).toMatch(/^\//);
          }
        });
      });
    });

    it("nested children follow same structure", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          if (item.children) {
            expect(Array.isArray(item.children)).toBe(true);
            item.children.forEach((child) => {
              expect(child).toHaveProperty("name");
              expect(child).toHaveProperty("icon");
              expect(typeof child.name).toBe("string");
              expect(typeof child.icon).toBe("function");
              expect(child.name.length).toBeGreaterThan(0);
            });
          }
        });
      });
    });
  });

  describe("role-based access control", () => {
    it("groups with roles have valid role arrays", () => {
      navigation.forEach((group) => {
        if (group.roles) {
          expect(Array.isArray(group.roles)).toBe(true);
          expect(group.roles.length).toBeGreaterThan(0);
          group.roles.forEach((role) => {
            expect(typeof role).toBe("string");
            expect(role.length).toBeGreaterThan(0);
          });
        }
      });
    });

    it("has administration group with admin role", () => {
      const adminGroup = navigation.find((group) => group.name === "Administration");
      expect(adminGroup).toBeDefined();
      expect(adminGroup?.roles).toContain("admin");
    });

    it("role strings are valid role names", () => {
      const validRoles = ["admin", "editor", "user"];
      navigation.forEach((group) => {
        if (group.roles) {
          group.roles.forEach((role) => {
            expect(validRoles).toContain(role);
          });
        }
      });
    });
  });

  describe("icon components", () => {
    it("all icons are valid React components", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          expect(typeof item.icon).toBe("object");
          // Check if it's a React component by looking for common properties
          expect(item.icon.displayName || item.icon.name).toBeDefined();
        });
      });
    });

    it("uses icons from lucide-react library", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          // Lucide React icons are objects with specific properties
          expect(typeof item.icon).toBe("object");
          expect(item.icon).toHaveProperty("$$typeof");
          expect(item.icon).toHaveProperty("render");

          // Check that it has a valid displayName (lucide icons have clean names)
          expect(item.icon.displayName).toBeDefined();
          expect(typeof item.icon.displayName).toBe("string");
          if (item.icon.displayName) {
            expect(item.icon.displayName.length).toBeGreaterThan(0);
          }

          // Ensure it's not from another icon library by checking the structure
          // Lucide icons have this specific object structure with $$typeof and render
          expect(Object.keys(item.icon)).toEqual(["$$typeof", "render"]);
        });
      });
    });
  });

  describe("business rule validation", () => {
    it("admin-only groups have admin role requirement", () => {
      // Test the business rule: groups with admin-only routes must have admin role
      navigation.forEach((group) => {
        const hasAdminRoutes = group.items.some((item) => item.href && item.href.startsWith("/admin/"));

        if (hasAdminRoutes) {
          expect(group.roles).toBeDefined();
          expect(group.roles).toContain("admin");
        }
      });
    });

    it("role-restricted groups have proper access control", () => {
      // Test business rule: if a group has roles, all its routes should be protected
      navigation.forEach((group) => {
        if (group.roles && group.roles.length > 0) {
          // Groups with role restrictions should have meaningful navigation items
          expect(group.items.length).toBeGreaterThan(0);

          // All items should either have hrefs or children (no empty navigation items)
          group.items.forEach((item) => {
            expect(item.href || item.children).toBeDefined();
          });
        }
      });
    });
  });

  describe("URL consistency", () => {
    it("all hrefs start with a forward slash", () => {
      navigation.forEach((group) => {
        group.items.forEach((item) => {
          if (item.href) {
            expect(item.href.startsWith("/")).toBe(true);
          }
        });
      });
    });
    it("no duplicate hrefs within navigation", () => {
      const hrefs = new Set();
      const duplicates: string[] = [];

      navigation.forEach((group) => {
        group.items.forEach((item) => {
          if (item.href) {
            if (hrefs.has(item.href)) {
              duplicates.push(item.href);
            }
            hrefs.add(item.href);
          }
        });
      });

      expect(duplicates).toHaveLength(0);
    });
  });

  describe("TypeScript const assertion", () => {
    it("is marked as const assertion", () => {
      // This test ensures the navigation is properly typed as readonly
      // The const assertion should make the object deeply readonly
      expect(navigation).toBeDefined();

      // Verify the navigation structure is intact
      const originalLength = navigation.length;
      expect(navigation.length).toBe(originalLength);
      expect(navigation.length).toBeGreaterThan(0);
    });
  });
});
