table structure:
pcnt.face_referer_data
    face_uuid text, -- PK, face_uuid
    person_id integer, -- FK person(person_id)
    photo bytea, -- not null
    comment text,
    embedding real[],
