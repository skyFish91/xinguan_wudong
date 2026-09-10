import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { CartService } from '../../service/cart';

/**
 * 前台-购物车
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppCartController extends BaseController {
  @Inject()
  cartService: CartService;

  @Inject()
  ctx;

  @Post('/add', { summary: '加购' })
  async addItem(@Body() body) {
    return this.ok(await this.cartService.addItem(this.ctx.user.id, body));
  }

  @Post('/update', { summary: '修改数量' })
  async updateItem(@Body() body) {
    return this.ok(
      await this.cartService.updateItem(this.ctx.user.id, body.itemId, body.quantity)
    );
  }

  @Post('/remove', { summary: '移除' })
  async removeItems(@Body('itemIds') itemIds: number[]) {
    return this.ok(await this.cartService.removeItems(this.ctx.user.id, itemIds));
  }

  @Post('/list', { summary: '购物车列表' })
  async listItems() {
    return this.ok(await this.cartService.listItems(this.ctx.user.id));
  }
}
