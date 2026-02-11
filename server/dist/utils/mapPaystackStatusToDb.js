export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["SUCCESSFUL"] = "SUCCESSFUL";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["REVERSED"] = "REVERSED";
    TransactionStatus["ONGOING"] = "ONGOING";
    TransactionStatus["VOIDED"] = "VOIDED";
    TransactionStatus["ABANDONED"] = "ABANDONED";
})(TransactionStatus || (TransactionStatus = {}));
export const mapPaystackStatusToDb = (paystackStatus) => {
    switch (paystackStatus) {
        case "success":
            return TransactionStatus.SUCCESSFUL;
        case "failed":
            return TransactionStatus.FAILED;
        case "abandoned":
            return TransactionStatus.CANCELLED;
        case "ongoing":
            return TransactionStatus.PENDING;
        case "reversed":
            return TransactionStatus.REVERSED;
        case "abandoned":
            return TransactionStatus.ABANDONED;
        case "ongoing":
            return TransactionStatus.ONGOING;
        case "voided":
            return TransactionStatus.VOIDED;
        default:
            return TransactionStatus.PENDING;
    }
};
