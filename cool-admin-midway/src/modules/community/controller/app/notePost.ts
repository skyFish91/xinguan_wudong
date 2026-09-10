import { Body, Inject, Post, Provide, Query, Get } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag, TagTypes, CoolTag } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NotePostService } from '../../service/notePost';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 前台-游记（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController('/app/notePost')
export class AppNotePostController extends BaseController {
  @Inject()
  notePostService: NotePostService;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  ctx;

  @Post('/publish', { summary: '发布游记' })
  async publish(@Body() body) {
    return this.ok(
      await this.notePostService.publish(this.ctx.user.id, body)
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/feed', { summary: '信息流' })
  async feed(@Body() query) {
    return this.ok(await this.notePostService.feed(query));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/detail', { summary: '游记详情' })
  async detail(@Body('id') id: number) {
    return this.ok(
      await this.notePostService.detail(id, this.ctx.user?.id)
    );
  }

  @Post('/delete', { summary: '删除游记' })
  async deletePost(@Body('id') id: number) {
    return this.ok(
      await this.notePostService.deletePost(id, this.ctx.user.id, this.ctx.user.role)
    );
  }

  @Post('/myPosts', { summary: '我的游记' })
  async myPosts(@Body() query) {
    return this.ok(
      await this.notePostService.myPosts(this.ctx.user.id, query)
    );
  }

  @Post('/myLikes', { summary: '我点赞的游记' })
  async myLikes(@Body() query) {
    return this.ok(
      await this.notePostService.myLikes(this.ctx.user.id, query)
    );
  }

  @Post('/like/toggle', { summary: '点赞/取消点赞' })
  async toggleLike(@Body() body: { targetType: 'POST' | 'COMMENT'; targetId: number }) {
    return this.ok(
      await this.notePostService.toggleLike(
        this.ctx.user.id,
        body.targetType,
        body.targetId
      )
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/user/info', { summary: '获取用户信息' })
  async getUserInfo(@Body('id') id: number) {
    const user = await this.userInfoEntity.findOne({ where: { id } });
    if (!user) {
      return this.ok(null);
    }
    delete user.password;
    return this.ok({
      id: user.id,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      phone: user.phone
    });
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/search', { summary: '搜索' })
  async search(@Body() query) {
    return this.ok(await this.notePostService.search(query));
  }
}
