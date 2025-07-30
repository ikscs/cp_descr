import React, { useEffect, useState } from "react";
import { getParams, updateParam } from "./SysParamService";
import { SysParam } from "./SysParamsTypes";


const renderField = (param: SysParam, value: any, onChange: (v: any) => void) => {
  switch (param.display_type) {
    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
      );
    case "select":
      return (
        <select value={value} onChange={e => onChange(e.target.value)}>
          {(param.enum_values?.split(",") || []).map(opt => (
            <option key={opt.trim()} value={opt.trim()}>
              {opt.trim()}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
        />
      );
    case "radio":
      return (
        <>
          {(param.enum_values?.split(",") || []).map(opt => (
            <label key={opt.trim()}>
              <input
                type="radio"
                name={param.name}
                value={opt.trim()}
                checked={value === opt.trim()}
                onChange={() => onChange(opt.trim())}
              />
              {opt.trim()}
            </label>
          ))}
        </>
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      );
  }
};

export default function SysParamsForm() {
  const [params, setParams] = useState<SysParam[]>([]);
  const [form, setForm] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParams().then(data => {
      setParams(data);
      const initialForm: Record<number, any> = {};
      data.forEach((p: SysParam) => {
        initialForm[p.id] = p.value?.value ?? "";
      });
      setForm(initialForm);
      setLoading(false);
    });
  }, []);

  const handleChange = (id: number, value: any) => {
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await Promise.all(
      params.map(param =>
        updateParam(param.id, { value: { value: form[param.id] } })
      )
    );
    alert("Параметры сохранены");
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {params
        .sort((a, b) => a.view_order - b.view_order)
        .map(param => (
          <div key={param.id} style={{ marginBottom: 16 }}>
            <label>
              {param.display_label}{" "}
              {renderField(param, form[param.id], v => handleChange(param.id, v))}
              {param.eu && <span> ({param.eu})</span>}
            </label>
            {param.description && (
              <div style={{ fontSize: 12, color: "#888" }}>{param.description}</div>
            )}
          </div>
        ))}
      <button type="submit">Сохранить</button>
    </form>
  );
}