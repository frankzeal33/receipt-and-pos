export enum TransactionStatus {
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
  REVERSED = "REVERSED",
  ONGOING = "ONGOING",
  VOIDED = "VOIDED",
  ABANDONED = "ABANDONED"
}

export const mapPaystackStatusToDb = (
  paystackStatus: string
): TransactionStatus => {
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
