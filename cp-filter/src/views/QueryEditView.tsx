import { usePresetContext } from '../contexts/PresetContext';

const QueryEditView: React.FC<{sourceQuery: string}> = ({sourceQuery}) => {

    const { 
        presetQuery, setPresetQuery,
    } = usePresetContext();

    const clearQuery = () => {
        setPresetQuery('');
    }

    const initQuery = () => {
        setPresetQuery(sourceQuery);
    }

    return (
        <div>
            <button
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                title="Clear"
                onClick={clearQuery}
                >
                <img src="/src/assets/close.png" 
                alt="Clear" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            <button
                style={{ marginLeft: '8px', cursor: 'pointer' }}
                title="Init"
                onClick={initQuery}
            >
                <img src="/src/assets/plus.png" 
                alt="Init" 
                style={{ width: '12px', height: '12px' }} 
                />
            </button>
            <textarea
                value={presetQuery}
                onChange={e => setPresetQuery(e.target.value)}
                style={{ width: 600, height: 500 }}
            />        
        </div>
    )
}

export default QueryEditView;