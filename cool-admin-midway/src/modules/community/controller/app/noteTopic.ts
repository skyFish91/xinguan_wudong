import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag, TagTypes, CoolTag } from '@cool-midway/core';
import { NoteTopicService } from '../../service/noteTopic';

/**
 * 前台-话题（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppNoteTopicController extends BaseController {
  @Inject()
  noteTopicService: NoteTopicService;

  @Inject()
  ctx;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/list', { summary: '话题列表' })
  async listTopics(@Body() query) {
    return this.ok(await this.noteTopicService.listTopics(query));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/detail', { summary: '话题详情' })
  async detail(@Body('id') id: number) {
    return this.ok(
      await this.noteTopicService.detail(id, this.ctx.user?.id)
    );
  }

  @Post('/follow', { summary: '关注/取关话题' })
  async toggleFollow(@Body('topicId') topicId: number) {
    return this.ok(
      await this.noteTopicService.toggleFollow(this.ctx.user.id, topicId)
    );
  }

  @Post('/posts', { summary: '话题下的游记' })
  async postsByTopic(@Body() query) {
    return this.ok(
      await this.noteTopicService.postsByTopic(query.topicId, query)
    );
  }

  @Post('/following', { summary: '用户关注的话题列表' })
  async followingTopics(@Body() query) {
    return this.ok(
      await this.noteTopicService.followingTopics(this.ctx.user.id, query)
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/init', { summary: '初始化测试数据' })
  async initTestData() {
    // 插入测试话题
    await this.noteTopicService.initTestData();
    return this.ok({ message: '初始化成功' });
  }
}
