import log from 'loglevel';
import { adminUserOperations } from "~/lib/supabase/admin";
import { createClient } from "~/lib/supabase/client";

export async function loader({ request }: { request: Request }) {
  try {
    // Verify the user is authenticated and has admin role
    const { supabase } = createClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if user has admin role
    const userMetadata = user.app_metadata || {};
    const userRoles = userMetadata.roles || ['user'];

    if (!userRoles.includes('admin')) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fetch all users
    const users = await adminUserOperations.getAllUsers();

    return new Response(JSON.stringify({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        banned_until: (user as any).banned_until
      }))
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    log.error('Admin users API error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    // Verify the user is authenticated and has admin role
    const { supabase } = createClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if user has admin role
    const userMetadata = user.app_metadata || {};
    const userRoles = userMetadata.roles || ['user'];

    if (!userRoles.includes('admin')) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const userId = formData.get("userId") as string;

    // Debug logging
    log.debug('API Debug:', {
      action,
      userId,
      allFormData: Object.fromEntries(formData.entries())
    });

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // userId is only required for actions that operate on existing users
    if (!userId && !["createUser"].includes(action)) {
      return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    switch (action) {
      case "updateRoles": {
        const rolesString = formData.get("roles") as string;
        if (!rolesString) {
          return new Response(JSON.stringify({ error: "Missing roles parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const roles = JSON.parse(rolesString);
        if (!Array.isArray(roles)) {
          return new Response(JSON.stringify({ error: "Roles must be an array" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const updatedUser = await adminUserOperations.updateUserRoles(userId, roles);

        return new Response(JSON.stringify({
          success: true,
          message: "User roles updated successfully",
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            user_metadata: updatedUser.user_metadata,
            app_metadata: updatedUser.app_metadata
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case "deleteUser": {
        // Prevent admin from deleting themselves
        if (userId === user.id) {
          return new Response(JSON.stringify({ error: "You cannot delete your own account" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        await adminUserOperations.deleteUser(userId);

        return new Response(JSON.stringify({
          success: true,
          message: "User deleted successfully"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case "disableUser": {
        // Prevent admin from disabling themselves
        if (userId === user.id) {
          return new Response(JSON.stringify({ error: "You cannot disable your own account" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const updatedUser = await adminUserOperations.disableUser(userId);

        return new Response(JSON.stringify({
          success: true,
          message: "User disabled successfully",
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            banned_until: (updatedUser as any).banned_until
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case "enableUser": {
        const updatedUser = await adminUserOperations.enableUser(userId);

        return new Response(JSON.stringify({
          success: true,
          message: "User enabled successfully",
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            banned_until: (updatedUser as any).banned_until
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      case "createUser": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;
        const rolesString = formData.get("roles") as string;

        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Email and password are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        let roles = ['user'];
        if (rolesString) {
          try {
            const parsedRoles = JSON.parse(rolesString);
            if (Array.isArray(parsedRoles)) {
              roles = ['user', ...parsedRoles.filter(role => role !== 'user')];
            }
          } catch {
            // Use default roles if parsing fails
          }
        }

        const newUser = await adminUserOperations.createUser(email, password, {
          full_name: fullName,
          roles
        });

        return new Response(JSON.stringify({
          success: true,
          message: "User created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: newUser.user_metadata,
            app_metadata: newUser.app_metadata
          }
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }

  } catch (error) {
    log.error('Admin users action error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}