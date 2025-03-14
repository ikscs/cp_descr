
export const api: {
    userName: string,
    userFullName: string,
    backend_url: string,
    backend_point_select?: string,
    backend_point_insert?: string,
    backend_point_upsert?: string,
    backend_point_update?: string,
    backend_point_create_temp?: string,
    backend_point_query?: string,
    backend_point_echo?: string,
} = { 
        userName: 'noname', 
        userFullName: 'noname',
        backend_url: 'https://rise.theweb.place/back', 
        backend_point_select: '/f5.php?func=cp3.js_select_b',
        backend_point_query: '/f5.php?func=cp3.js_query_b',
        backend_point_insert: '/f5.php?func=cp3.js_insert_b',
        backend_point_upsert: '/f5.php?func=cp3.js_upsert_b',
        backend_point_update: '/f5.php?func=cp3.js_update_b',
        backend_point_create_temp: '/f5.php?func=cp3.js_create_temp',
        backend_point_echo: '/f5.php?func=cp3.js_echo',
    }
