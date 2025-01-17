// import React from "react";

const AppContext: {
    userName: string,
    backend_url: string | null,
    backend_point_select?: string,
    backend_point_insert?: string,
    backend_point_update?: string,
    backend_point_create_temp?: string,
    backend_point_query?: string,
    backend_point_echo?: string,
} = { backend_url: null, userName: 'alavr'}

export default AppContext;