set
    check_function_bodies = off;

create policy "Editors and Admins can delete chapter" on "public"."chapter" as permissive for delete to authenticated using (has_editorial_role ());

create policy "Editors and Admins can insert chapter" on "public"."chapter" as permissive for insert to authenticated
with
    check (has_editorial_role ());

create policy "Editors and Admins can update chapter" on "public"."chapter" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

create policy "Enable read for all users" on "public"."chapter" as permissive for
select
    to public using (true);

create policy "Editors and Admins can delete equipment" on "public"."equipment" as permissive for delete to authenticated using (has_editorial_role ());

create policy "Editors and Admins can insert equipment" on "public"."equipment" as permissive for insert to authenticated
with
    check (has_editorial_role ());

create policy "Editors and Admins can update equipment" on "public"."equipment" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

create policy "Enable read for all users" on "public"."equipment" as permissive for
select
    to public using (true);

create policy "Editors and Admins can delete equipment_required_item" on "public"."equipment_required_item" as permissive for delete to authenticated using (has_editorial_role ());

create policy "Editors and Admins can insert equipment_required_item" on "public"."equipment_required_item" as permissive for insert to authenticated
with
    check (has_editorial_role ());

create policy "Editors and Admins can update equipment_required_item" on "public"."equipment_required_item" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

create policy "Enable read for all users" on "public"."equipment_required_item" as permissive for
select
    to public using (true);

create policy "Editors and Admins can delete equipment_stat" on "public"."equipment_stat" as permissive for delete to authenticated using (has_editorial_role ());

create policy "Editors and Admins can insert equipment_stat" on "public"."equipment_stat" as permissive for insert to authenticated
with
    check (has_editorial_role ());

create policy "Editors and Admins can update equipment_stat" on "public"."equipment_stat" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

create policy "Enable read for all users" on "public"."equipment_stat" as permissive for
select
    to public using (true);

create policy "Editors and Admins can delete mission" on "public"."mission" as permissive for delete to authenticated using (has_editorial_role ());

create policy "Editors and Admins can insert mission" on "public"."mission" as permissive for insert to authenticated
with
    check (has_editorial_role ());

create policy "Editors and Admins can update mission" on "public"."mission" as permissive for
update to authenticated using (has_editorial_role ())
with
    check (has_editorial_role ());

create policy "Enable read for all users" on "public"."mission" as permissive for
select
    to public using (true);