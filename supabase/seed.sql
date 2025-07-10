-- ABOUTME: Database seed file for Hero Wars Helper - creates initial admin user
-- ABOUTME: This file is automatically run during `supabase db reset` to seed the database
-- Create admin user for Hero Wars Helper
-- This user will be created with verified email and admin role
INSERT INTO
  auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token,
    email_change
  )
VALUES
  (
    gen_random_uuid (),
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    crypt ('~!adminShoes.09', gen_salt ('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"roles": ["admin"]}',
    '{}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

-- Create corresponding identity record for the admin user
INSERT INTO
  auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  )
VALUES
  (
    gen_random_uuid (),
    (
      SELECT
        id
      FROM
        auth.users
      WHERE
        email = 'admin@example.com'
    ),
    (
      SELECT
        id
      FROM
        auth.users
      WHERE
        email = 'admin@example.com'
    )::text,
    jsonb_build_object(
      'sub',
      (
        SELECT
          id
        FROM
          auth.users
        WHERE
          email = 'admin@example.com'
      )::text,
      'email',
      'admin@example.com',
      'email_verified',
      true
    ),
    'email',
    NOW(),
    NOW()
  );