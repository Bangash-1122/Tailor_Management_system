export const generateCustomerCode = async (Customer) => {
  const count = await Customer.countDocuments();
  return `CUST-${String(count + 1).padStart(5, '0')}`;
};

export const generateOrderNo = async (Order) => {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  });
  return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
};
