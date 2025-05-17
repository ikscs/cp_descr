SELECT to_char(ed.dt, CASE :mode
                          WHEN 'DAY' THEN 'hh24'
                          ELSE 'yyyy-mm-dd'
                      END) AS dd,
       COUNT(*) AS cnt
FROM pcnt.v_event_data ed
WHERE (point_id = :point
       OR :point::text = '')
     AND (:mode = 'PERIOD'
          AND (to_char(ed.dt, 'yyyy-mm-dd') BETWEEN :d1 and :d2
               or :d1 = ''
               or :d2 = '')
          OR :mode = 'DAY'
          AND to_char(ed.dt, 'yyyy-mm-dd') BETWEEN :d1 and :d2
          OR :mode = 'WEEK'
          AND ed.dt::date BETWEEN CURRENT_DATE - INTERVAL '1 week' AND CURRENT_DATE - INTERVAL '1 day'
          OR :mode = 'MONTH'
          AND ed.dt::date BETWEEN CURRENT_DATE - INTERVAL '1 month' AND CURRENT_DATE - INTERVAL '1 day'
          OR :mode = 'YEAR'
          AND ed.dt::date BETWEEN CURRENT_DATE - INTERVAL '1 year' AND CURRENT_DATE - INTERVAL '1 day')
GROUP BY 1
ORDER BY 1