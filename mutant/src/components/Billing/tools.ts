import { api } from "./api";

const CheckBalance = async () => {
    const balance = await api.getBalance();
    if (!!balance && balance?.value <= 0)
        return confirm("Средств не достаточно. Вы хотите пополнить счет?")
    else
        return true;
}

export default CheckBalance;
