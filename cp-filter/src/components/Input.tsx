interface IInputStringProps {
    size: number,
    placeholder?: string,
    value: string,
    setValue: (value: string) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
}

interface IInputNumberProps {
    size: number,
    placeholder?: string,
    value: number,
    setValue: (value: number) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
}

const InputString: React.FC<IInputStringProps> = ({ size, value, setValue, placeholder, onKeyDown }) => {

    return (
    <>
        <input 
            type="text" 
            size={size}
            placeholder={placeholder}
            value={value}
            onChange={(e:any)=>{ setValue(e.target.value) }}
            onKeyDown={onKeyDown}/>
        
        <div style={{width: '10px'}}/>
    </>
    )
}

const InputNumber: React.FC<IInputNumberProps> = ({ size, value, setValue, placeholder, onKeyDown }) => {

    return (
    <>
        <input 
            type="text" 
            size={size}
            placeholder={placeholder}
            value={value}
            onChange={(e:any)=>{ setValue(e.target.value) }}
            onKeyDown={onKeyDown}/>
        
        <div style={{width: '10px'}}/>
    </>
    )
}

export {InputString, InputNumber}
