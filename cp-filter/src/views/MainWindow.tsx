import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import { /*getCount,*/ getData, } from '../api/dataTools'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AppContext from "../contexts/AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "../tools/treetools"
import { getGridCols, getGridRows, productFind, toExcel } from '../tools/gridtools'
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
import RawDataView from "./RawDataView";
import ArticleGridView from "./ArticleGridView";
import { useHotkeys } from 'react-hotkeys-hook'

const emptyTree = treeToJson([], 'product_group', 'product_group')

const emptySubj = 'emptySubj'
const defaultRole = 0

const S = () => (<div style={{width: '10px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const dataSourceOptions = [
    {label: 'Все субъекты', value:'cp3.vcp_product_org'},
    {label: 'ikscs', value:'cp3.ikscs'},
    {label: 'cp', value:'cp3.vcp_product_org_rated'},
]

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','preset'])
    AppContext.userName = cookies.user
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState(emptySubj);
    const { 
        preset, setPreset, 
        manufGridRowsSelected, setManufGridRowsSelected,
        manufGridRows, setManufGridRows,
        articleGridRows, setArticleGridRows,
        articleGridRowsSelected, setArticleGridRowsSelected,
        nameGridRows, setNameGridRows,
        nameGridRowsSelected, setNameGridRowsSelected,
        /*manufGridCols, setManufGridCols,*/
    } = usePresetContext();

    const [dataSource, setDataSource] = useState('');
    const [userOptions, setUserOptions] = useState<IValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<IValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<IValueLabel[]>([]);
    const [presetOptions, setPresetOptions] = useState<IValueLabel[]>([]);
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(10000);
    const [manufFilter, setManufFilter] = useState('');
    const [articleFilter, setArticleFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
    const [textareaValue, setTextareaValue] = useState('');
    const [footerText, setFooterText] = useState('')
    const [manufGridEnabled, setManufGridEnabled] = useState<boolean>(true) 
    const [presetSaveTo,setPresetSaveTo] = useState('')
    const [tabFilterColor,setTabFilterColor] = useState('yellow')

    const [rawSubjectRole,setRawSubjectRole] = useState(-1)
    const [rawSubjectId,setRawSubjectId] = useState('')
    const [rawProductId,setRawProductId] = useState('')

    const [manufToGoogle, setManufToGoogle] = useState('')
    const [articleToGoogle, setArticleToGoogle] = useState('')

    const [tabIndex, setTabIndex] = useState(0);

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

        setSubr(defaultRole)

        setPresetOptions(await getData({
            from: 'cp3.perm_preset', 
            fields: 'preset_id',
            where: {app_id: packageJson.name},
            order: 'preset_id',
        }, 'preset_id', 'preset_id'))

        setGridCols(getGridCols())

        const queryParameters = new URLSearchParams(window.location.search)
        const preset_ = queryParameters.get('preset')
        console.log('preset', preset_)
        // onComboPresetChange({value: !!preset_ ? preset_ : '1'}) // default preset
        preset_ && onComboPresetChange({value: preset_}) // no default preset
        setTabFilterColor(!!preset_ ? 'yellow' : 'white')
        setManufGridEnabled(!!preset_)
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
        setTabIndex(0)
        setGridRows([])
        await longExec(async() => {
            subj != emptySubj && await putTreeSelected(treeSelected, subr, subj)

            const manufList: string[] = manufGridEnabled ? manufGridRows
                .filter(data => manufGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const articleList: string[] = manufGridEnabled ? articleGridRows
                .filter(data => articleGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const nameList: string[] = manufGridEnabled ? nameGridRows
                .filter(data => nameGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const data = await getGridRows(subj == emptySubj, subr, manufFilter, articleFilter, 
                gridLimit, manufList, articleList, nameList, dataSource)
            
            setTextareaValue(data.query)
            if (!data.ok) {
                throw new Error('Error fetching data') 
            }
            setGridRows(data.data)
        })
    }

    const rowKeyGetter = (row: any) => {
        // return row.group +'/'+ row.manuf_org +'/'+ row.article_org
        return row.subject_role +'/'+ row.subject_id +'/'+ row.product_id  +'/'+ row.group
    }

    const onRowSelect = (rows: any) => {
        console.log(rows.size)
        if (rows.size == 0)
            return

        // var x = new Set();
        // x.add(1);
        // x.add({ a: 2 });
        //get iterator:
        var it = rows.values();
        //get first entry:
        var first = it.next();
        //get value out of the iterator entry:
        var value = first.value;
        console.log(value); //1

        const key = value.split('/')
        setRawSubjectRole(parseInt(key[0]))
        setRawSubjectId(key[1])
        setRawProductId(key[2])
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
            articleRows, articleSelected, 
            nameRows, nameSelected, 
        } = await presetDataGet(value)
        setManufGridRows(manufRows)
        setManufGridRowsSelected(new Set(manufSelected))
        setArticleGridRows(articleRows)
        setArticleGridRowsSelected(new Set(articleSelected))
        setNameGridRows(nameRows)
        setNameGridRowsSelected(new Set(nameSelected))
    setCookie('preset', value, { path: '/' })
    }

    const clearAll = () => {
        setManufFilter('')
        setArticleFilter('')
        setGridRows([])
        setTextareaValue('')
        setManufGridEnabled(false)
        setTabFilterColor('white')
    }

    useEffect(() => {
        init()
    }, [])

    const savePreset = async () => {
        await longExec(async() => {
            await presetDataPost(preset, 
                manufGridRows, manufGridRowsSelected,
                articleGridRows, articleGridRowsSelected,
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
                articleGridRows, articleGridRowsSelected,
                nameGridRows, nameGridRowsSelected,
            )
            console.log('r',r)
        })
    }

    const getSubrLabel = (v: number): string => {
        const found = roleOptions.find((opt) => opt.value == v);
        return found?.label || 'No Data'
    }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const searchGoogle = () => openInNewTab('https://www.google.com/search?q=' + articleToGoogle)
    const searchJoomla = async () => {
        const found = await productFind(manufToGoogle,articleToGoogle)
        if (found.ok) {
            const dict: { [id: string]: string; } = {
                ikscs: 'https://ikscs.in.ua/store/product/view/',
                mc: 'https://mc.in.ua/store/product/view/',
            }
            const schema = found.schema || 'ikscs'
            const url = dict[schema] + found.category_id + '/' + found.product_id
            console.log('(url',url)
            openInNewTab(url)
        } else {
            alert(`Cannot find ${manufToGoogle} / ${articleToGoogle}}`)
        }
    }
    // react-hotkeys
    // react-hot-keys
    // react-hotkeys-hook
    // useHotkeys('ctrl+k', () => setCount(count + 1), [count])
    useHotkeys('ctrl+shift+g', () => openInNewTab('https://www.google.com/search?q=' + articleToGoogle))
    useHotkeys('ctrl+shift+f', async () => {
        const found = await productFind(manufToGoogle,articleToGoogle)
        if (found.ok) {
            const dict: { [id: string]: string; } = {
                ikscs: 'https://ikscs.in.ua/store/product/view/',
                mc: 'https://mc.in.ua/store/product/view/',
            }
            const schema = found.schema || 'ikscs'
            const url = dict[schema] + found.category_id + '/' + found.product_id
            console.log('(url',url)
            openInNewTab(url)
        } else {
            alert(`Cannot find ${manufToGoogle} / ${articleToGoogle}}`)
        }
    })
    useHotkeys('F9', async () => {initGrid()})
    
    const onCellClick = (row: any) => {
        console.log(row.row.article)
        // setArticleToGoogle(row.row.article)
    }
    
    const onSelectedCellChange = (cellInfo: any) => {
        setManufToGoogle(cellInfo.row.manuf)
        setArticleToGoogle(cellInfo.row.article)
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
                    placeholder="DataSource"
                    options={dataSourceOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        if (value == 'cp3.ikscs') {
                            setSubr(0)
                            initSubjects(0)
                        }
                        setDataSource(value)
                    }}
                    title="DataSource"
                />
                <S/>
                <Combo
                    placeholder="Role"
                    options={roleOptions}
                    defaultChoice={{
                        value: subr,
                        label: getSubrLabel(subr), 
                    }}
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
                    size={10}
                    placeholder="Article ?"
                    value={articleFilter}
                    setValue={setArticleFilter}/>
                <InputNumber
                    size={3}
                    placeholder="Limit ?"
                    value={gridLimit}
                    setValue={setGridLimit}/>
                <S/>
                <button title={'F9'} onClick={ initGrid }>Выбрать</button>
                <button onClick={clearAll}>Очистить</button>
                <button onClick={ () => toExcel(gridCols,gridRows)}>Excel</button>
                <button title={'Search Google (ctrl+shift+g)'} onClick={ searchGoogle }>G</button>
                <button title={'Search Joomla (ctrl+shift+f)'} onClick={ searchJoomla }>F</button>
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
                <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
                    <TabList>
                        <Tab key='1' tabIndex='1'>Data</Tab>
                        <Tab key='2' tabIndex='2' style={{
                            backgroundColor: tabFilterColor,
                            // backgroundClip: 'initial'
                        }}>Data Filter</Tab>
                        <Tab key='3' tabIndex='3'>Presets</Tab>
                        <Tab key='4' tabIndex='4'>Raw Data</Tab>
                    </TabList>
                    <TabPanel key='1'>
                        <div style={{/*width: '100%',*/ height: '100%', }}>
                            <Grid width="1500px"
                                cols={gridCols}
                                rows={gridRows}
                                rowKeyGetter={rowKeyGetter}
                                onCellClick={onCellClick}
                                onSelectedRowsChange={onRowSelect}
                                onSelectedCellChange={onSelectedCellChange}
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
                                onChange={(v) => {
                                    setTabFilterColor(v ? 'yellow' : 'white')
                                    setManufGridEnabled(v)
                                }}
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
                                <ArticleGridView/>
                                <S/>
                                <NameGridView/>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel key='3'>
                        <PresetView/>
                    </TabPanel>
                    <TabPanel key='4'>
                        <RawDataView 
                            subject_role={rawSubjectRole}
                            subject_id={rawSubjectId}
                            product_id={rawProductId}
                        />
                    </TabPanel>
                </Tabs>
            </div>
            <textarea 
                id='textarea'
                value={textareaValue}
                style={{width:600, height:200, }} 
            />
            
            {/* 
            <br/><button onClick={() => openInNewTab('https://stackoverflow.com')}>openInNewTab</button>
            <br/><button onClick={() => openInNewTab('https://rise.theweb.place/back/f1.php?f=cp3.get_cp_product_r2&p=ERC')}>openInNewTab</button> 
            */}
            
            <Footer 
                text={footerText}
                backgroundColor={footerColor}
            />
            <S/><label>-</label><S/><label>-</label>
        </CookiesProvider>
    )
}

export default MainWindow
