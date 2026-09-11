import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In } from 'typeorm';
import { NoteTopicEntity } from '../entity/noteTopic';
import { NoteTopicFollowEntity } from '../entity/noteTopicFollow';
import { NotePostEntity } from '../entity/notePost';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 话题服务（设计文档 §26.3、§26.4）
 */
@Provide()
export class NoteTopicService extends BaseService {
  @InjectEntityModel(NoteTopicEntity)
  topicEntity: Repository<NoteTopicEntity>;

  @InjectEntityModel(NoteTopicFollowEntity)
  followEntity: Repository<NoteTopicFollowEntity>;

  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

  /**
   * 话题列表（推荐话题 + 全部话题）
   */
  async listTopics(query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const [list, total] = await this.topicEntity.findAndCount({
      where: { status: 1 },
      order: {
        isRecommend: 'DESC',
        sort: 'DESC',
        followCount: 'DESC',
      },
      skip,
      take: size,
    });

    return { list, pagination: { page, size, total } };
  }

  /**
   * 话题详情（含下游记列表）
   */
  async detail(id: number, userId?: number) {
    const topic = await this.topicEntity.findOne({ where: { id } });
    if (!topic || topic.status !== 1) {
      throw bizError(ErrorCode.NOT_FOUND, '话题不存在');
    }

    const followed = userId
      ? await this.followEntity.findOne({ where: { userId, topicId: id } })
      : null;

    return { ...topic, followed: !!followed };
  }

  /**
   * 关注/取关话题
   */
  async toggleFollow(userId: number, topicId: number) {
    const exist = await this.followEntity.findOne({ where: { userId, topicId } });

    return this.followEntity.manager.transaction(async em => {
      if (exist) {
        await em.delete(NoteTopicFollowEntity, exist.id);
        await em.decrement(NoteTopicEntity, { id: topicId }, 'followCount', 1);
        return { followed: false };
      } else {
        await em.save(NoteTopicFollowEntity, { userId, topicId });
        await em.increment(NoteTopicEntity, { id: topicId }, 'followCount', 1);
        return { followed: true };
      }
    });
  }

  /**
   * 话题下的游记列表
   */
  async postsByTopic(topicId: number, query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    // 使用 JSON_CONTAINS 查询包含该话题的游记
    const qb = this.postEntity
      .createQueryBuilder('p')
      .where('p.status = 1')
      .andWhere(`JSON_CONTAINS(p.topicIds, CAST(:topicId AS JSON))`, { topicId: String(topicId) })
      .orderBy('p.createTime', 'DESC')
      .skip(skip)
      .take(size);

    const [list, total] = await qb.getManyAndCount();

    return {
      list,
      pagination: { page, size, total },
    };
  }

  /**
   * 用户关注的话题列表
   */
  async followingTopics(userId: number, query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const [follows, total] = await this.followEntity.findAndCount({
      where: { userId },
      order: { createTime: 'DESC' },
      skip,
      take: size,
    });

    const topicIds = follows.map(f => f.topicId);
    let topics = [];
    if (topicIds.length > 0) {
      topics = await this.topicEntity.find({
        where: { id: In(topicIds) },
      });
    }

    return {
      list: topics,
      pagination: { page, size, total },
    };
  }

  /**
   * 初始化测试数据
   */
  async initTestData() {
    const testTopics = [
      // 推荐话题（前5个）
      {
        name: '苗寨梯田风光',
        intro: '乌东梯田四季如画，晨雾缭绕，摄影天堂',
        cover: 'https://picsum.photos/400/300?random=1',
        postCount: 24,
        followCount: 312,
        isRecommend: 1,
        sort: 100,
      },
      {
        name: '苗族银饰锻造',
        intro: '传承千年的银饰工艺，每件都是艺术品',
        cover: 'https://picsum.photos/400/300?random=2',
        postCount: 18,
        followCount: 267,
        isRecommend: 1,
        sort: 99,
      },
      {
        name: '苗家长桌宴',
        intro: '十二道特色菜，品味苗族招待最高礼仪',
        cover: 'https://picsum.photos/400/300?random=3',
        postCount: 31,
        followCount: 389,
        isRecommend: 1,
        sort: 98,
      },
      {
        name: '蜡染与苗绣',
        intro: '手工蜡染和苗绣技艺，非遗工坊探秘',
        cover: 'https://picsum.photos/400/300?random=4',
        postCount: 22,
        followCount: 298,
        isRecommend: 1,
        sort: 97,
      },
      {
        name: '苗年节庆',
        intro: '苗年、吃新节、牯藏节，感受苗寨文化盛典',
        cover: 'https://picsum.photos/400/300?random=5',
        postCount: 19,
        followCount: 245,
        isRecommend: 1,
        sort: 96,
      },
      // 非推荐话题
      {
        name: '酸汤鱼美食',
        intro: '黔东南招牌菜，酸辣鲜香停不下来',
        cover: 'https://picsum.photos/400/300?random=6',
        postCount: 28,
        followCount: 356,
        isRecommend: 0,
        sort: 95,
      },
      {
        name: '吊脚楼建筑',
        intro: '苗族传统吊脚楼民宿，感受原汁原味的风情',
        cover: 'https://picsum.photos/400/300?random=7',
        postCount: 26,
        followCount: 278,
        isRecommend: 0,
        sort: 94,
      },
      {
        name: '芦笙舞与飞歌',
        intro: '苗族芦笙舞和飞歌，民族音乐的灵魂',
        cover: 'https://picsum.photos/400/300?random=8',
        postCount: 14,
        followCount: 187,
        isRecommend: 0,
        sort: 93,
      },
      {
        name: '苗族服饰搭配',
        intro: '传统苗装配银饰，盛装出门的必备指南',
        cover: 'https://picsum.photos/400/300?random=9',
        postCount: 20,
        followCount: 231,
        isRecommend: 0,
        sort: 92,
      },
      {
        name: '苗医苗药探秘',
        intro: '传统苗医药文化，祖传秘方传承至今',
        cover: 'https://picsum.photos/400/300?random=10',
        postCount: 12,
        followCount: 156,
        isRecommend: 0,
        sort: 91,
      },
      {
        name: '乌东村旅游攻略',
        intro: '吃住行玩全攻略，自由行必读指南',
        cover: 'https://picsum.photos/400/300?random=11',
        postCount: 35,
        followCount: 421,
        isRecommend: 0,
        sort: 90,
      },
      {
        name: '古茶树与茶文化',
        intro: '贵州古茶树，品鉴原生态好茶',
        cover: 'https://picsum.photos/400/300?random=12',
        postCount: 16,
        followCount: 198,
        isRecommend: 0,
        sort: 89,
      },
      {
        name: '鼓藏节仪式',
        intro: '十三年一次的盛大仪式，文化符号的传承',
        cover: 'https://picsum.photos/400/300?random=13',
        postCount: 11,
        followCount: 142,
        isRecommend: 0,
        sort: 88,
      },
      {
        name: '苗寨手工艺品',
        intro: '竹编、侗布、铜鼓工艺，民族手工艺精品',
        cover: 'https://picsum.photos/400/300?random=14',
        postCount: 17,
        followCount: 209,
        isRecommend: 0,
        sort: 87,
      },
      {
        name: '民俗摄影之旅',
        intro: '捕捉苗寨人文之美，记录非遗传承故事',
        cover: 'https://picsum.photos/400/300?random=15',
        postCount: 23,
        followCount: 267,
        isRecommend: 0,
        sort: 86,
      },
    ];

    // 清空已有数据
    await this.topicEntity.delete({});

    // 插入新数据
    for (const topic of testTopics) {
      await this.topicEntity.save({
        ...topic,
        status: 1,
      });
    }
  }
}
