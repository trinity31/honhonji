CREATE OR REPLACE VIEW tags_list_view AS
SELECT
    tags.id,
    tags.name,
    tags.category,
    tags.description,
    tags.displayOrder,
    tags.created_at,
    tags.updated_at,
    COUNT(place_to_tags.place_id) AS place_count
FROM
    public.tags
INNER JOIN
    public.place_to_tags ON tags.id = place_to_tags.tag_id
GROUP BY
    tags.id;