import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import { /*getCount,*/ getData, } from '../api/dataTools'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AppContext from "../contexts/AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "../tools/treetools"
import { getGridCols, getGridRows, toExcel } from '../tools/gridtools'
import '../components/footer.css'
import Footer from "../components/Footer"
import Combo, { IValueLabel } from "../components/combo"
import MultiSelectCheckbox from "../components/MultiSelectCheckbox"
import Grid from "../components/gridFilter"
import packageJson from '../../package.json';
import { InputString,InputNumber } from "../components/Input"
import Checkbox from "../components/checkbox";
import ManufGridView from "./ManufGridView";
import { usePresetContext } from "../contexts/PresetContext";
import { presetDataGet, presetDataPost } from "../tools/presettools";
import NameGridView from "./NameGridView";
import PresetView from "./PresetView";

const emptyTree = treeToJson([], 'product_group', 'product_group')

const emptySubj = 'emptySubj'
const drfaultRole = 0
// const emptyPreset = ''

const S = () => (<div style={{width: '10px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','preset'])
    AppContext.userName = cookies.user
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState(emptySubj);
    // const [preset, setPreset] = useState(emptyPreset);
    const { 
        preset, setPreset, 
        manufGridRowsSelected, setManufGridRowsSelected,
        manufGridRows, setManufGridRows,
        nameGridRows, setNameGridRows,
        nameGridRowsSelected, setNameGridRowsSelected,
        /*manufGridCols, setManufGridCols,*/
    } = usePresetContext();
    const [userOptions, setUserOptions] = useState<IValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<IValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<IValueLabel[]>([]);
    const [presetOptions, setPresetOptions] = useState<IValueLabel[]>([]);
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(1000);
    const [manufFilter, setManufFilter] = useState('');
    const [articleFilter, setArticleFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
    const [textareaValue, setTextareaValue] = useState('');
    const [footerText, setFooterText] = useState('')
    const [manufGridEnabled, setManufGridEnabled] = useState<boolean>(true) 
    const [presetSaveTo,setPresetSaveTo] = useState('')
    // const [manufGridRows, setManufGridRows] = useState<any[]>([]) 
    // const [manufGridCols, setManufGridCols] = useState<any[]>([]) 
    // const [manufGridRowSelected, setManufGridRowSelected] = useState<Set<number>>(new Set())
    
    console.log('MainWindow', user)
    const init = async () => {
        
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

        setSubr(drfaultRole)

        setPresetOptions(await getData({
            from: 'cp3.perm_preset', 
            fields: 'preset_id',
            order: 'preset_id',
        }, 'preset_id', 'preset_id'))

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
        rows.forEach((row: any) => { 
            if (row.parent_group === null) 
                row.parent_group = 'root' 
        })
        rows.unshift({product_group: 'root', parent_group: null, name: 'Root', subject_id: subj, subject_role: subr, })
        setTreeData(treeToJson(rows, 'product_group', 'parent_group'))
        setTreeSelected([])
    }
    
    const longExec = async (f: Function) => {
        await withErrorHandling(async () => {
            await f()
        });
    }

    const initGrid = async () => {
        await longExec(async() => {
            subj != emptySubj && await putTreeSelected(treeSelected, subr, subj)

            const manufList: string[] = manufGridEnabled ? manufGridRows
                .filter(data => manufGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const nameList: string[] = manufGridEnabled ? nameGridRows
                .filter(data => nameGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const data = await getGridRows(subj == emptySubj, subr, manufFilter, articleFilter, gridLimit, manufList, nameList)
            
            setTextareaValue(data.query)
            if (!data.ok) {
                throw new Error('Error fetching data') 
            }
            setGridRows(data.data)
        })
    }

    const rowKeyGetter = (row: any) => {
        return row.group +'/'+ row.manuf_org +'/'+ row.article_org
    }

    const onRowSelect = (rows: any) => {
        console.log(rows.size)
    }

    const withErrorHandling = async (asyncFunc: () => Promise<void>) => {
        try {
            setTextareaValue('')
            
            setFooterText('Running');
            setFooterColor('darkmagenta')
            await asyncFunc();
            setFooterText('Ok');
            setFooterColor('navy')
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error:', error);
                setFooterText(error.message);
            } else {
                console.error('Error: unknown error');
                setFooterText('An unknown error occurred');
            }
            setFooterColor('red');
        }
    };

    const onComboPresetChange = async ({value}: { value: string }) => {
        setPreset(value)
        const {
            manufRows, manufSelected, 
            nameRows, nameSelected, 
        } = await presetDataGet(value)
        setManufGridRows(manufRows)
        setManufGridRowsSelected(new Set(manufSelected))
        setNameGridRows(nameRows)
        setNameGridRowsSelected(new Set(nameSelected))
    setCookie('preset', value, { path: '/' })
    }

    const clearAll = () => {
        setManufFilter('')
        setArticleFilter('')
        setGridRows([])
        setTextareaValue('')
    }

    useEffect(() => {
        init()
    }, [])

    const savePreset = async () => {
        await longExec(async() => {
            await presetDataPost(preset, 
                manufGridRows, manufGridRowsSelected,
                nameGridRows, nameGridRowsSelected,
            )
        })
    }

    const savePresetAs = async () => {
        await longExec(async() => {
            if (!presetSaveTo)
               throw new Error('Preset name is Empty');

            const r = await presetDataPost(presetSaveTo, 
                manufGridRows, manufGridRowsSelected,
                nameGridRows, nameGridRowsSelected,
            )
            console.log('r',r)
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
                    title="User"
                    width='100px'
                />
                <S/>
                <Combo
                    placeholder="Role"
                    options={roleOptions}
                    // defaultChoice={{
                    //     value: drfaultRole, 
                    //     label: roleOptions.find(option => option.value === drfaultRole)?.label || ''}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubr(value)
                        initSubjects(value)
                        setSubj(emptySubj)
                        initTreeData(-1,emptySubj)
                        setGridRows([])
                    }}
                    title="Subject Role"
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
                    title="Subject"
                />
                <S/>
                <InputString
                    size={5}
                    placeholder="Manuf ?"
                    value={manufFilter}
                    setValue={setManufFilter}/>
                <InputString
                    size={5}
                    placeholder="Article ?"
                    value={articleFilter}
                    setValue={setArticleFilter}/>
                <InputNumber
                    size={3}
                    placeholder="Limit ?"
                    value={gridLimit}
                    setValue={setGridLimit}/>
                <S/>
                <button onClick={ initGrid }>Выбрать</button>
                <button onClick={clearAll}>Очистить</button>
                <button onClick={ () => toExcel(gridCols,gridRows)}>Excel</button>
                <S/>
            </div> 
            
            <div className='flexbox-container'>
                <div title='tree' style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => setTreeSelected(items)}
                        width='300px'
                    />
                </div>
                <Tabs>
                    <TabList>
                        <Tab key='1' tabIndex='1'>Data</Tab>
                        <Tab key='2' tabIndex='2'>Data Filter</Tab>
                        <Tab key='3' tabIndex='2'>Presets</Tab>
                    </TabList>
                    <TabPanel key='1'>
                        <div style={{/*width: '100%',*/ height: '100%', }}>
                            <Grid width="1500px"
                                cols={gridCols}
                                rows={gridRows}
                                rowKeyGetter={rowKeyGetter}
                                // onCellClick={onCellClick}
                                onSelectedRowsChange={onRowSelect}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel key='2'>
                        <div style={{/*width: '100%',*/ height: '100%', }}>
                            
                            <div className='flexbox-container-single'>
                            {/* <div style={{display: flex; align-items: center}}/> */}
                            <label>Пресет</label><S/>
                            <Combo
                                placeholder='Unknown'
                                defaultChoice={{value: preset, label: preset}}
                                options={presetOptions}
                                onChange={onComboPresetChange}
                                title='Preset'
                            />
                            <button
                                style={{ marginLeft: '8px', cursor: 'pointer' }}
                                title="Save Preset"
                                onClick={savePreset}
                            >Сохранить</button>&nbsp;
                            <button
                                style={{ marginLeft: '8px', cursor: 'pointer' }}
                                title="Save Preset"
                                onClick={savePresetAs}
                            >Сохранить как</button>&nbsp;
                            <InputString
                                    size={5}
                                    placeholder="preset ?"
                                    value={presetSaveTo}
                                    setValue={setPresetSaveTo}/>
                            </div>

                            <Checkbox
                                label='Включить'
                                checked={manufGridEnabled}
                                onChange={setManufGridEnabled}
                            />

                            <div className='flexbox-container'>
                                <S/>
                                <ManufGridView 
                                    // width="400px" 
                                    // height="200px"
                                    // manufGridRows={manufGridRows}
                                    // setManufGridRows={setManufGridRows}
                                    // manufGridCols={manufGridCols}
                                    // setManufGridCols={setManufGridCols}
                                    // manufGridRowsSelected={manufGridRowsSelected}
                                    // setManufGridRowsSelected={setManufGridRowSelected}
                                    // preset={preset}
                                    // setPreset={setPreset}
                                />
                                <S/>
                                <NameGridView/>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel key='3'>
                        <PresetView/>
                    </TabPanel>
                </Tabs>
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

export default MainWindow
