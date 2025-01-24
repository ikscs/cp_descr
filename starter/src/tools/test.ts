enum ELang {
    ua = 'ua',
    ru = 'ru',
    en = 'en',
  }
  
  enum EType {
    name = 'name',
    description = 'description',
  }
  
  interface IDescrValue { 
    descr: string;
    state: number; 
  }
  
    type InternalDescr = {
        [key in EType]: Record<ELang, IDescrValue>;
    };
  
  const makeInternalDescr = (): InternalDescr => {
    const d: InternalDescr = {
      [EType.name]: {
        [ELang.ua]: { descr: '', state: -1 },
        [ELang.ru]: { descr: '', state: -1 },
        [ELang.en]: { descr: '', state: -1 },
      },
      [EType.description]: {
        [ELang.ua]: { descr: '', state: -1 },
        [ELang.ru]: { descr: '', state: -1 },
        [ELang.en]: { descr: '', state: -1 },
      },
    };
  
    return d;
};

    const d = makeInternalDescr()
    d['name']['en'] = {descr: '123123', state: 0}  // no expected error
    // d['name']['123'] = {descr: '123123', state: 0} // expected error
