import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import './components/footer.css'
import Footer from "./components/Footer"
import Combo from "./components/combo"
import { /*getCount,*/ getData, } from './api/dataTools'
import AppContext from "./AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "./tools/treetools"
import { getGridCols, getGridRows, postGrid } from './tools/gridtools2'
import MultiSelectCheckbox from "./components/MultiSelectCheckbox"
import { fetchData } from "./api/fetchData"
import Grid from "./components/grid"
// import Checkbox from "./components/checkbox"
import packageJson from '../package.json';
import { IDescrFilter, IValueLabel, } from './types'
import { getDescrData, makeDescr, IDescrDetail, ELang, EType, copyDescr } from "./tools/descrtools"
import { transOptions, transExec } from "./tools/transtools"

const emptyTree = treeToJson([], 'product_group', 'product_group')

const S = () => (<div style={{width: '20px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const AltWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','descrState','descrStateName','descrType'])
    AppContext.userName = cookies.user
    const [footerText, setFooterText] = useState('') 
    const [userOptions, setUserOptions] = useState<IValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<IValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<IValueLabel[]>([]);
    const [descrStateOptions, setDescrStateOptions] = useState<IValueLabel[]>([]);
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState('Unknown');
    const [descrFilter, setDescrFilter] = useState<IDescrFilter>({});
    // const [langFilter, setLangFilter] = useState<ILang>({ua: true,});
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(1000);
    const [manufFilter, setManufFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
    const [descrDetail, setDescrDetail] = useState<IDescrDetail>(makeDescr());
    const [descrPostDisabled, setDescrPostDisabled] = useState(true);
    const [textareaValue, setTextareaValue] = useState('');
    const [transDir, setTransDir] = useState('');
    const [transRows, setTransRows] = useState([]);
    
    console.log(user)
    console.log('descrDetail', descrDetail)
    // console.log(gridCols)
    // console.log(gridRows)

    // const debug = (arg0: any) => {
    //     setTextareaValue(JSON.stringify(arg0))
    // }
        
    const init = async () => {
        
        // const permCount = await getCount({
        //     from: 'cp3.perm_data',
        //     where: {user_name: 'alavr'}
        // })
        // alert(permCount)

        setUserOptions(await getData({
            from: 'cp3.perm_user', 
            fields: 'user_name,user_full_name',
            order: 'user_full_name',
        }, 'user_name','user_full_name'))
        
        setUser(cookies.user)

        setRoleOptions(await getData({
            from: 'cp3.cp_subject_role', 
            // fields: 'subject_role,description',
            fields: 'subject_role, subject_role||\'\'-\'\'||description AS description',
            order: 'subject_role',
        }, 'subject_role','description'))
        // setSubr(2)

        const descrStateData = await getData({
            from: 'translate.descr_state', 
            fields: 'descr_state, descr_state||\'\'-\'\'||description AS description',
        }, 'descr_state','description')
        descrStateData.push({value: -1, label: 'Любой'})
        setDescrStateOptions(descrStateData.sort((a:any,b:any)=>a.value-b.value))
        // setDescrState(cookies.descrState)
        setDescrFilter(prev => ({...prev, descrState: cookies.descrState}))

        const descrTypeData = await getData({
            from: 'translate.descr_type', 
            fields: 'descr_type',
            order: 'descr_type DESC',
        }, 'descr_type','descr_type')
        setDescrFilter(prev => ({...prev, descrTypeOptions: descrTypeData}))
        setDescrFilter(prev => ({...prev, descrType: cookies.descrType || 'name'}))

        setGridCols(getGridCols())
    }
    
    const initSubjects = async (subr: number) => {
        setSubjectOptions(await getData({
            from: 'cp3.cp_subject', 
            fields: 'subject_id,name',
            order: 'subject_id',
            where: { subject_role: subr}
        }, 'subject_id','name'))
    }
    
    const initTreeData = async (subr: number, subj: string) => {
        const rows = await getTreeData(subr, subj)
        setTreeData(treeToJson(rows, 'product_group', 'parent_group'))
    }
    
    const longExec = async (f: Function) => {
        setTextareaValue('')
        setFooterColor('darkmagenta')
        await f()
        setFooterColor('navy')
    }
    // const longExecStart = () => setFooterColor('darkmagenta')
    // const longExecStop = () => setFooterColor('navy')

    const initGrid = async () => {
        if (subr == -1) {
            alert('Choose role / subject')
        }

        await longExec(async() => {
            // setGridCols(getGridCols())
            setDescrDetail(makeDescr())

            await putTreeSelected(treeSelected, subr, subj)
            const data = await getGridRows(manufFilter, descrFilter, gridLimit)
            setGridRows(data[0]?.data)
            setTextareaValue(data[0]?.query)
        })
    }

    const initGridProd = async () => {
        await longExec(async() => {

        await putTreeSelected(treeSelected, subr, subj)

        //setFooterColor('darkmagenta')
        const cols = ['product_id', 'manuf', 'article', 'qtty', 'price_sell', 'name', 'subject_role', 'subject_id',]
        const andManufFilter = manufFilter ? `AND manuf ilike ''%${manufFilter}%''` : ``
        // const andDescrState = descrState ? 'AND 1=1' : ''
        const andDescrState = descrFilter.descrState ? 'AND 1=1' : ''
        const query = 
    `
    SELECT ${cols.join(',')}
    FROM cp3.vcp_product_org JOIN temp_cp_group USING (subject_role, subject_id, product_group)
    WHERE product_exists AND qtty > 0 ${andManufFilter} ${andDescrState}
    ${gridLimit ? 'LIMIT ' + gridLimit : '' }
    `
        setTextareaValue(query)
        const fetchParam = {
            backend_point: AppContext.backend_point_query,
            user: AppContext.userName,
            restore: ['temp_cp_group'],
            query: query,
        }
        setGridCols(cols.map(col => ({key: col, name: col, }))) // width: 5, 
        const data = await fetchData(fetchParam)
        setGridRows(data[0]?.data)
        // setFooterColor('navy')
        })
    }
    console.log(initGridProd)
    // const onTreeSelect = async (items: any) => {
    //     longExecStart
    //     await putTreeSelected(items, subr, subj )
    //     longExecStop
    // }

    const rowKeyGetter = (row: any) => {
        // return row.subject_role +'/'+ row.subject_id +'/'+row.product_id
        return row.manuf +'/'+ row.article
    }

    const onCellClick = async (cell: any) => {
        console.log('cell', cell)
        const dede: IDescrDetail = await getDescrData(cell.row.manuf, cell.row.article)
        setDescrDetail(dede)
        setDescrPostDisabled(true)
    }

    const onRowSelect = (rows: any) => {
        setTransRows(rows)
    }

    const descrPost = async () => {
        setDescrPostDisabled(true)
        alert('about to write')
    }

    const onManufFilterInput = (e:any) => {
        setManufFilter(e.target.value)
    }

    const onDescriptionFilterInput = (e:any) => {
        setDescrFilter(prev => ({...prev, descrDescr: e.target.value}))
    }

    const clearAll = () => {
        setManufFilter('')
        setGridCols([])
        setGridRows([])
        setTextareaValue('')
        setDescrFilter(prev => ({...prev, descrState: -1}))
        // todo: setTreeSelected([])
    }

    const translate = (type: EType) => {
        transExec(transRows, transDir, type)
        initGrid()
    }

    useEffect(() => {
        init()
    }, [])

    const typeLangState = (type: EType, lang: ELang) => 
        `${type} - ${lang} ( ${descrDetail[type][lang].state} )`

    const updateDescrValue = (type: EType, lang: ELang, value: string) => {
        setDescrDetail((prev) => {
            const next = copyDescr(prev)
            next[type][lang].value = value
            console.log('prev',prev[type][lang].value)
            console.log('next',next[type][lang].value)
            return next
        })
    }

    return (
        <CookiesProvider>
            <div className='flexbox-container'>
                <H4 text={packageJson.name+'/'+packageJson.version}/>
                <Combo
                    placeholder='No User'
                    options={userOptions}
                    defaultChoice={{value: cookies.user, label: cookies.userFullName}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setUser(value)
                        setCookie('user', value, { path: '/' })
                        setCookie('userFullName', label, { path: '/' })
                        AppContext.userName = value
                    }}
                />
                <S/>
                <Combo
                    placeholder="Role"
                    options={roleOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubr(value)
                        initSubjects(value)
                        initTreeData(-1,'noname')
                        setGridRows([])
                    }}
                />
                <S/>
                <Combo
                    placeholder="Subject"
                    options={subjectOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubj(value)
                        initTreeData(subr,value)
                        setGridRows([])
                    }}
                />
                <S/>
                <input 
                    type="text" 
                    size={5}
                    placeholder="Manuf"
                    value={manufFilter}
                    onChange={(val)=>{ onManufFilterInput(val) }}/>
                <S/>
                <input 
                    type="text" 
                    size={5}
                    placeholder="Description"
                    value={descrFilter.descrDescr}
                    onChange={(val)=>{ onDescriptionFilterInput(val) }}/>
                <S/>
                <Combo
                    placeholder="Descr Type"
                    options={descrFilter.descrTypeOptions??[]}
                    defaultChoice={{value: cookies.descrType, label: cookies.descrType}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setDescrFilter(prev => ({...prev, descrType: value}))
                        setCookie('descrType', value, { path: '/' })
                    }}
                />
                <S/>
                <Combo
                    placeholder="Descr State"
                    options={descrStateOptions}
                    defaultChoice={{value: cookies.descrState, label: cookies.descrStateName}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        // setDescrState(value)
                        setDescrFilter(prev => ({...prev, descrState: value}))
                        setCookie('descrState', value, { path: '/' })
                        setCookie('descrStateName', label, { path: '/' })
                    }}
                />
                {/* <S/>
                <Checkbox
                    defaultValue={langFilter.ua || false}
                    label='ua'
                    onChange={(e) => setLangFilter(prev => ({...prev, ua: e})) }
                />
                <S/>
                <Checkbox
                    defaultValue={langFilter.en || false}
                    label='en'
                    onChange={(e) => setLangFilter(prev => ({...prev, en: e})) }
                />
                <S/>
                <Checkbox
                    defaultValue={langFilter.ru || false}
                    label='ru'
                    onChange={(e) => setLangFilter(prev => ({...prev, ru: e})) }
                /> 
                <S/>*/}
                <input 
                    type="text" 
                    size={3}
                    placeholder="Limit"
                    value={gridLimit}
                    onChange={(e:any)=>{ setGridLimit(e.target.value) }}/>
                <S/>
                <button onClick={initGrid}>Применить</button>
                <button onClick={clearAll}>Очистить</button>
                {/* <button onClick={initGridProd}>Action 3</button> */}
                <S/>
                <Combo
                    placeholder="Translate"
                    options={transOptions}
                    onChange={({value}) => {
                        setTransDir(value)
                    }}
                    width={'130px'}
                />
                <S/>
                <button onClick={()=>translate(EType.name)}>Перевести</button>
            </div> 
            
            <div className='flexbox-container2'>
                <div title='tree' style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => setTreeSelected(items)}
                    />
                </div>

                <div title='grid' style={{/*width: '100%',*/ height: '100%', }}>
                    <Grid
                        cols={gridCols}
                        rows={gridRows}
                        rowKeyGetter={rowKeyGetter}
                        onRowsChange={(rows: any, data: any) => {
                            postGrid(rows, data)
                        }}
                        onCellClick={onCellClick}
                        onRowSelect={onRowSelect}
                    />
                </div>

                <div title="descr">
                    <H4 text={typeLangState(EType.name,ELang.ua)}/>
                    <input
                        type="text" 
                        size={100}
                        style={{width:'100%', height:30, marginBottom: 10, }}
                        placeholder="No data"
                        value={descrDetail[EType.name][ELang.ua].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.name, ELang.ua, e.target.value)
                        }}
                    />
                    <H4 text={typeLangState(EType.name,ELang.ru)}/>
                    <input
                        type="text" 
                        size={100}
                        style={{width:'100%', height:30, marginBottom: 10, }}
                        placeholder="No data"
                        value={descrDetail[EType.name][ELang.ru].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.name, ELang.ru, e.target.value)
                        }}
                    />
                    <H4 text={typeLangState(EType.name,ELang.en)}/>
                    <input
                        type="text"
                        size={100}
                        style={{width:'100%', height:30, marginBottom: 10, }}
                        placeholder="No data"
                        value={descrDetail[EType.name][ELang.en].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.name, ELang.en, e.target.value)
                        }}
                    />
                    <H4 text={typeLangState(EType.description,ELang.ua)}/>
                    <textarea
                        placeholder="No data"
                        style={{width:'100%', height:100, }}
                        value={descrDetail[EType.description][ELang.ua].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.description, ELang.ua, e.target.value)
                        }}
                    />
                    <H4 text={typeLangState(EType.description,ELang.ru)}/>
                    <textarea
                        placeholder="No data"
                        style={{width:'100%', height:100, }}
                        value={descrDetail[EType.description][ELang.ru].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.description, ELang.ru, e.target.value)
                        }}
                    />
                    <H4 text={typeLangState(EType.description,ELang.en)}/>
                    <textarea 
                        placeholder="No data"
                        style={{width:'100%', height:100, }}
                        value={descrDetail[EType.description][ELang.en].value}
                        onChange={(e: any)=>{ 
                            setDescrPostDisabled(false)
                            updateDescrValue(EType.description, ELang.en, e.target.value)
                        }}
                    />
                    <button onClick={descrPost} disabled={descrPostDisabled} >Записать</button>
                </div>
            </div>
            <textarea 
                id='textarea'
                value={textareaValue}
                style={{width:600, height:200, }} 
            />

            <Footer 
                text={footerText}
                backgroundColor={footerColor}
            />
            <S/><label>-</label><S/><label>-</label>
        </CookiesProvider>
    )
}

export default AltWindow
