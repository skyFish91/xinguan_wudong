import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartEntity } from '../entity/cart';
import { CartItemEntity } from '../entity/cartItem';
import { OrderService } from '../../order/service/order';
import { CartItemType } from '../../../common/constants/biz-type';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 统一购物车服务（设计文档 §9）
 * 加购库存/规格校验由各板块自己的 Service 做，本服务只负责存取。
 */
@Provide()
export class CartService extends BaseService {
  @InjectEntityModel(CartEntity)
  cartEntity: Repository<CartEntity>;

  @InjectEntityModel(CartItemEntity)
  cartItemEntity: Repository<CartItemEntity>;

  @Inject()
  orderService: OrderService;

  async getCart(userId: number) {
    let cart = await this.cartEntity.findOneBy({ userId });
    if (!cart) {
      cart = await this.cartEntity.save({ userId });
    }
    return cart;
  }

  async addItem(
    userId: number,
    item: { itemType: string; targetId: number; skuId?: number; quantity: number }
  ) {
    if (
      ![CartItemType.PRODUCT, CartItemType.FARM].includes(
        item.itemType as CartItemType
      )
    ) {
      throw bizError(ErrorCode.CART_ITEM_INVALID, '购物车仅支持商品/特产');
    }
    const cart = await this.getCart(userId);
    const exist = await this.cartItemEntity.findOneBy({
      cartId: cart.id,
      itemType: item.itemType,
      targetId: item.targetId,
      skuId: item.skuId ?? null,
    });
    if (exist) {
      await this.cartItemEntity.update(exist.id, {
        quantity: exist.quantity + item.quantity,
      });
    } else {
      await this.cartItemEntity.save({ cartId: cart.id, ...item });
    }
  }

  async updateItem(userId: number, itemId: number, quantity: number) {
    const cart = await this.getCart(userId);
    await this.cartItemEntity.update(
      { id: itemId, cartId: cart.id },
      { quantity }
    );
  }

  async removeItems(userId: number, itemIds: number[]) {
    const cart = await this.getCart(userId);
    await this.cartItemEntity.delete({ cartId: cart.id, id: In(itemIds) });
  }

  async listItems(userId: number) {
    const cart = await this.getCart(userId);
    const items = await this.cartItemEntity.findBy({ cartId: cart.id });
    return items;
  }

  /**
   * 从购物车结算（设计文档 §9）：按 merchantId 拆单。
   * 「商品/特产 → 商家」映射只有衣/食板块知道，为避免公共层反向依赖业务板块，
   * 结算由业务板块在调用前完成「校验 + 组装 CreateOrderParams[]」，
   * 再调用 OrderService.createFromCart（Task 4 已实现）。本方法留桩。
   */
  async createFromCart(
    userId: number,
    cartItemIds: number[],
    addressId: number,
    clientRequestId: string
  ) {
    throw new Error('需要业务板块提供商品/特产 -> merchantId 映射后实现');
  }
}
