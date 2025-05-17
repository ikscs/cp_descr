select -1 value,
       'Всі' label
UNION ALL
select point_id value,
       name label
from pcnt.point
WHERE customer = :customer