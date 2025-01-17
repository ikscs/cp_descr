import { fetchData } from "../api/fetchData"
import AppContext from "../AppContext"
import { makeCreateScript, } from '../api/permanent'

// https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
const treeToJson = (rows: any[], key: string, parent: string) => {
    let map: any = {}
    let roots: any[] = []
    
    for (let i = 0; i < rows.length; i += 1) {
        map[rows[i][key]] = i
        rows[i].children = []
    }
  
    for (const row of rows) {
        row.metadata = { key: row[key] }
        if (row[parent]) {
            rows[map[row[parent]]].children.push(row);
        } else {
            roots.push(row);
        }
    }
    return {name: '', children: roots};
}

const getTreeData = async (subr: number, subj: string) => {
    const rows = await fetchData({
        fields: 'subject_role,subject_id,product_group,parent_group,name',
        from: 'cp3.cp_group',
        order: 'product_group',
        where: {subject_role: subr, subject_id: subj},
    })
    return rows
}

const onTreeSelect = async (groups: any, subr: number, subj: string) => {
    console.log(groups)
    const dest = 'temp_cp_group'
    const fieldDefs = [
      'subject_role numeric',
      'subject_id text',
      'product_group text',
    ]
    // const values = groups.map((group: any) => [subr, subj, group.metadata.key])
    const values = groups.map((group: any) => ({
      subject_role: subr, 
      subject_id: subj, 
      product_group: group.metadata.key
    }))

    // permanent
    const user = AppContext.userName
    const createScript = makeCreateScript({
      dest: dest,
      fieldDefs: fieldDefs,
    })
    // const tableData = makeInsertValues(values)
    const tableData = JSON.stringify(values)

    const query = 
`
INSERT INTO cp3.perm_data (user_name,table_name,create_script,table_data) 
VALUES ( ''${user}'',''${dest}'', ''${createScript}'', ''${tableData}'' )
ON CONFLICT (user_name, table_name) DO UPDATE SET 
	create_script = EXCLUDED.create_script,
	table_data = EXCLUDED.table_data  
`
    const fetchParam = {
      backend_point: AppContext.backend_point_query,
      user: user,
      query: query,
    }        
    console.log(fetchParam)
    const result = await fetchData(fetchParam)
    console.log(result)
    if (!result[0].ok) {
      alert(JSON.stringify(result[0].data))
    }
}

export {treeToJson, getTreeData, onTreeSelect}