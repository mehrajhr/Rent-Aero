import {
  OrderStatus,
  PaymentStatus,
} from "../../../prisma/generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createCheckoutSession = async (orderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { gear: true },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.customerId !== customerId) {
    throw new Error("Unauthorized access to this order.");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { orderId },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.PAID) {
    throw new Error("This order has already been paid.");
  }

  let payment = existingPayment;

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        orderId,
        customerId,
        status: "PENDING",
        amount: order.totalAmount,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Rental Order #${order.id.slice(0, 8)}`,
            description: `Rental payment for gear items.`,
          },
          unit_amount: Math.round(order.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.app_url}/payment?success=true`,
    cancel_url: `${config.app_url}/payment?success=false`,
    metadata: {
      orderId,
      paymentId: payment.id,
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: session.id },
  });

  return { checkoutUrl: session.url };
};

export const paymentService = {
  createCheckoutSession,
};
