import BaseRouter from './BaseRouter';
import TransactionController from '../controllers/TransactionController';
// import AuthMiddleware from '../middlewares/auth.middleware';

class TransactionRoutes extends BaseRouter {
  routes(): void {
    // const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.get('/transaction/todays/:id_merchant', TransactionController.todayTransaction);
    this.router.get('/transaction/monthly/:id_merchant', TransactionController.monthlyTransaction);
    this.router.get('/transaction/year/:id_merchant', TransactionController.yearTransaction);
    this.router.get('/transaction/laundry-inprocess/:id_merchant', TransactionController.laundryInProcess);

    this.router.post('/transaction/chartmothly/:id_merchant', TransactionController.chartMonthlyTransaction);
    this.router.post('/transaction/chartmothly-expenses/:laundry', TransactionController.chartMonthlyExpenses);
    this.router.post('/transaction/chartincome-expense/:id_merchant/:laundry',
      TransactionController.incomeExpenseChart);
  }

}

export default TransactionRoutes;
