import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
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

  @Post('/list', { summary: '话题列表' })
  async listTopics(@Body() query) {
    return this.ok(await this.noteTopicService.listTopics(query));
  }

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
}
