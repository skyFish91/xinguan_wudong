/**
 * 社区接口适配层
 * ------------------------------------------------------------------
 * 背景：本目录下的社区页面最初移植自 Cool-Admin 版前端，接口按
 *   POST /app/notePost/*、/app/noteTopic/* 这套契约调用，
 *   而统一后端（server，7001）提供的是 RESTful 的 /api/community/*。
 *   两者路径、动词、响应结构、字段命名都不一致（页面里甚至混用
 *   p_id 与 id 两套命名）。
 *
 * 因此本文件承担三件事，页面代码无需改动：
 *   1. 路径与动词转换：/app/noteXxx/* → /api/community/*
 *   2. 响应结构归一：话题裸数组 → { list }；images JSON 字符串 → 数组；
 *      作者/回复人嵌套对象 → 扁平字段；评论两级嵌套 → 扁平列表（页面自行建树）
 *   3. 字段别名：同一份数据同时给出 camelCase 与 p_* / t_* 命名，
 *      兼容不同页面的写法
 * ------------------------------------------------------------------
 */
import request from './request';

type Any = Record<string, any>;

/* ------------------------------ 基础工具 ------------------------------ */

/** 后端 images 字段是 JSON 字符串，统一转数组 */
const asArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/** 图片项可能是字符串，也可能是 { url } / { imageUrl } 对象 */
const toUrl = (img: any): string => {
  if (!img) {
    return '';
  }
  if (typeof img === 'string') {
    return img;
  }
  return img.url || img.imageUrl || img.path || '';
};

const str = (value: any, fallback = ''): string =>
  value === null || value === undefined || value === '' ? fallback : String(value);

const num = (value: any): number => Number(value) || 0;

/** 分页结果统一为 { list, total, page, pageSize, pagination } */
const listResult = (data: any, mapper: (raw: Any) => Any) => {
  const raw: Any[] = Array.isArray(data) ? data : (data && data.list) || [];
  const total = Array.isArray(data) ? raw.length : num(data?.total ?? raw.length);
  const page = Array.isArray(data) ? 1 : num(data?.page) || 1;
  const pageSize = Array.isArray(data) ? raw.length : num(data?.pageSize) || raw.length;
  return {
    list: raw.map(mapper),
    total,
    page,
    pageSize,
    pagination: { total, page, pageSize },
  };
};

/* ------------------------------ 字段归一 ------------------------------ */

const normalizeTopic = (raw: Any = {}): Any => {
  const name = str(raw.name || raw.t_name);
  const intro = str(raw.intro || raw.description || raw.t_intro);
  const cover = str(raw.cover || raw.coverImage || raw.t_cover);
  return {
    ...raw,
    id: raw.id,
    t_id: raw.id,
    name,
    t_name: name,
    intro,
    t_intro: intro,
    description: intro,
    cover,
    t_cover: cover,
    followCount: num(raw.followCount ?? raw.t_follow_count),
    t_follow_count: num(raw.followCount ?? raw.t_follow_count),
    postCount: num(raw.postCount ?? raw.t_post_count),
    t_post_count: num(raw.postCount ?? raw.t_post_count),
    isFollowed: !!raw.isFollowed,
  };
};

/**
 * 游记归一
 * @param imageObjects true 时 images 返回 [{url}]（详情页按对象取用），否则返回字符串数组
 */
const normalizePost = (raw: Any = {}, imageObjects = false): Any => {
  const author = raw.author || raw.user || {};
  const urls = asArray(raw.images).map(toUrl).filter(Boolean);
  const topicList: Any[] =
    Array.isArray(raw.topics) && raw.topics.length
      ? raw.topics.map((t: Any) => normalizeTopic(t))
      : raw.topic
        ? [normalizeTopic(raw.topic)]
        : [];
  const createTime = str(raw.publishedAt || raw.createdAt || raw.createTime);
  const liked = !!(raw.isLiked ?? raw.liked);
  const favorited = !!(raw.isFavorited ?? raw.favorited);
  const followed = !!(raw.isFollowed ?? raw.followed);

  return {
    ...raw,
    id: raw.id,
    p_id: raw.id,
    title: str(raw.title),
    p_title: str(raw.title),
    content: str(raw.content),
    p_content: str(raw.content),
    cover: urls[0] || '',
    p_cover: urls[0] || '',
    images: imageObjects ? urls.map(url => ({ url, imageUrl: url })) : urls,
    imageUrls: urls,
    videoUrl: str(raw.videoUrl),
    p_video_url: str(raw.videoUrl),
    userId: raw.userId,
    authorId: raw.userId,
    userName: str(author.nickname || raw.userName, '乌东用户'),
    userAvatar: str(author.avatar || raw.userAvatar),
    author: { id: author.id ?? raw.userId, nickname: str(author.nickname), avatar: str(author.avatar) },
    createTime,
    p_create_time: createTime,
    likeCount: num(raw.likeCount),
    p_like_count: num(raw.likeCount),
    commentCount: num(raw.commentCount),
    p_comment_count: num(raw.commentCount),
    favoriteCount: num(raw.favoriteCount),
    viewCount: num(raw.viewCount),
    p_view_count: num(raw.viewCount),
    topicId: raw.topicId ?? null,
    topicName: topicList[0]?.name || str(raw.topicName),
    topicNames: topicList.map(t => t.name),
    topics: topicList,
    poiName: str(raw.linkedName || raw.poiName),
    isLiked: liked,
    liked,
    isFavorited: favorited,
    favorited,
    isFollowed: followed,
    followed,
  };
};

/** 评论归一：作者、回复人信息拍平；保留 parentId 供页面建树 */
const normalizeComment = (raw: Any = {}): Any => {
  const author = raw.user || {};
  const replyTo = raw.replyTo || {};
  const parentId = num(raw.parentId);
  return {
    ...raw,
    id: raw.id,
    content: str(raw.content),
    userId: raw.userId,
    userName: str(author.nickname || raw.userName, '乌东用户'),
    userAvatar: str(author.avatar || raw.userAvatar),
    createTime: str(raw.createdAt || raw.createTime),
    likeCount: num(raw.likeCount),
    isLiked: !!(raw.isLiked ?? raw.liked),
    parentId,
    rootId: parentId,
    replyToUserId: raw.replyUserId ?? null,
    replyToUserName: str(replyTo.nickname || raw.replyToUserName),
    replies: [],
  };
};

/** 把后端的两级评论结构拍平成列表（页面自己按 parentId 建树） */
const flattenComments = (data: any): Any[] => {
  const roots = Array.isArray(data) ? data : (data && data.list) || [];
  const flat: Any[] = [];
  roots.forEach((root: Any) => {
    const children = asArray(root.replies);
    const { replies: _rootReplies, ...rootRest } = root;
    flat.push(normalizeComment(rootRest));
    children.forEach((child: Any) => {
      const { replies: _childReplies, ...childRest } = child;
      flat.push(normalizeComment(childRest));
    });
  });
  return flat;
};

const normalizeUser = (raw: Any = {}): Any => ({
  ...raw,
  id: raw.id,
  nickname: str(raw.nickname, '乌东用户'),
  name: str(raw.nickname, '乌东用户'),
  avatar: str(raw.avatar),
  bio: str(raw.bio),
  // 以下字段后端暂未提供，给默认值避免页面渲染异常
  coverImage: str(raw.coverImage),
  level: num(raw.level) || 1,
  likedCount: num(raw.likedCount ?? raw.favoriteCount),
  postCount: num(raw.postCount),
  followerCount: num(raw.followerCount),
  followingCount: num(raw.followingCount),
  isFollowed: !!raw.isFollowed,
});

/* ------------------------------ 图片/视频上传 ------------------------------ */

const doUpload = async (file: File, onProgress?: (e: any) => void): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res: any = await request.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
  const first = Array.isArray(res) ? res[0] : res;
  return (first && (first.url || first.path)) || '';
};

/* ------------------------------ 业务接口 ------------------------------ */

export const communityApi = {
  /** 信息流 */
  async getFeed(params: Any = {}) {
    const sort = params.sort || params.tab;
    const tab =
      sort === 'hot' || params.orderBy === 'p_like_count' ? 'hot' : sort === 'follow' ? 'follow' : 'all';
    const data: any = await request.get('/community/posts', {
      params: {
        tab,
        page: params.page || 1,
        pageSize: params.pageSize || params.size || 10,
        topicId: params.topicId || undefined,
        authorId: params.authorId || undefined,
      },
    });
    return listResult(data, raw => normalizePost(raw));
  },

  /** 发布游记 */
  async publish(data: Any = {}) {
    const images = asArray(data.images).map(toUrl).filter(Boolean);
    const topicIds = asArray(data.topicIds);
    return request.post('/community/posts', {
      title: data.title,
      content: data.content,
      images: JSON.stringify(images),
      videoUrl: data.videoUrl || '',
      topicId: topicIds[0] || data.topicId || undefined,
      linkedType: data.linkedType || (data.poiId ? 'poi' : ''),
      linkedId: data.linkedId || data.poiId || null,
      linkedName: data.linkedName || data.poiName || '',
    });
  },

  /** 游记详情 */
  async getDetail(id: any) {
    const data: any = await request.get(`/community/posts/${id}`);
    return normalizePost(data, true);
  },

  /** 删除游记 */
  async deletePost(id: any) {
    return request.post(`/community/my/posts/${id}/delete`);
  },

  /** 综合搜索：type = post / topic / user */
  async search(params: Any = {}) {
    const type = params.type || 'post';
    const data: any = await request.get('/community/search', {
      params: {
        keyword: params.keyword || params.q || '',
        type,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      },
    });
    const mapper =
      type === 'topic' ? normalizeTopic : type === 'user' ? normalizeUser : (raw: Any) => normalizePost(raw);
    return listResult(data, mapper as (raw: Any) => Any);
  },

  /** 话题列表 */
  async getTopics(_params: Any = {}) {
    const data: any = await request.get('/community/topics');
    return listResult(data, normalizeTopic);
  },

  /** 话题详情 */
  async getTopicDetail(id: any) {
    const data: any = await request.get(`/community/topics/${id}`);
    return normalizeTopic(data);
  },

  /** 话题下的游记 */
  async getTopicPosts(topicId: any, params: Any = {}) {
    const data: any = await request.get('/community/posts', {
      params: {
        tab: 'all',
        topicId,
        page: params.page || 1,
        pageSize: params.pageSize || params.size || 10,
      },
    });
    return listResult(data, raw => normalizePost(raw));
  },

  /** 关注/取关话题（后端为切换语义） */
  async followTopic(topicId: any) {
    return request.post(`/community/topics/${topicId}/follow`);
  },

  /** 评论列表 */
  async getComments(postId: any, _params: Any = {}) {
    const data: any = await request.get(`/community/posts/${postId}/comments`);
    const list = flattenComments(data);
    return {
      list,
      total: list.length,
      pagination: { total: list.length, page: 1, pageSize: list.length || 10 },
    };
  },

  /** 发表评论 / 二级回复 */
  async addComment(payload: Any = {}) {
    const { postId, content, parentId } = payload;
    return request.post(`/community/posts/${postId}/comments`, {
      content,
      parentId: parentId || 0,
    });
  },

  /** 发表评论（页面使用的别名写法） */
  async createComment(payload: Any = {}) {
    return this.addComment(payload);
  },

  /** 删除自己的评论 */
  async deleteComment(id: any) {
    return request.post(`/community/comments/${id}/delete`);
  },

  /** 点赞/取消点赞：targetType 兼容 POST/COMMENT 大写写法 */
  async toggleLike(payload: Any = {}) {
    const targetType = String(payload.targetType || 'post').toLowerCase();
    return request.post('/community/like', {
      targetType,
      targetId: payload.targetId ?? payload.postId,
    });
  },

  async likePost(postId: any) {
    return this.toggleLike({ targetType: 'post', targetId: postId });
  },

  async unlikePost(postId: any) {
    return this.toggleLike({ targetType: 'post', targetId: postId });
  },

  /** 收藏/取消收藏游记 */
  async toggleFavorite(payload: Any = {}) {
    return request.post(`/community/posts/${payload.targetId ?? payload.postId}/favorite`);
  },

  /** 关注/取关用户（后端为切换语义） */
  async followUser(userId: any) {
    return request.post('/community/follow', { followUserId: userId });
  },

  async unfollowUser(userId: any) {
    return request.post('/community/follow', { followUserId: userId });
  },

  /** 用户公开主页 */
  async getUserProfile(userId: any) {
    const data: any = await request.get(`/community/users/${userId}`);
    return normalizeUser(data);
  },

  /**
   * 关联地点候选（发布游记时选择）
   * 原实现请求 POST /app/poi/list（Cool-Admin 契约，代理指向未部署的 8001），
   * 必然失败并退化为硬编码地点。这里改为取统一后端的景区列表。
   */
  async getPois() {
    const data: any = await request.get('/travel/scenics');
    const raw: Any[] = Array.isArray(data) ? data : (data && data.list) || [];
    return raw.map((item: Any) => ({
      id: item.id,
      name: str(item.name),
      address: str(item.address),
    }));
  },

  /** 举报 */
  async report(payload: Any = {}) {
    const targetType = String(payload.targetType || 'post').toLowerCase();
    const reason = [payload.type, payload.reason, payload.contact]
      .filter((item: any) => item !== undefined && item !== null && item !== '')
      .join(' | ');
    return request.post('/community/reports', {
      targetType: ['post', 'comment'].includes(targetType) ? targetType : 'post',
      targetId: payload.targetId ?? payload.postId,
      reason: reason || '违规内容',
    });
  },

  async reportPost(postId: any, reason: any) {
    return this.report({ targetType: 'post', targetId: postId, reason });
  },
};

export const uploadApi = {
  /** 上传图片，返回可访问 URL */
  async uploadImage(file: File) {
    return doUpload(file);
  },

  /** 上传视频，支持进度回调，返回可访问 URL */
  async uploadVideo(file: File, onProgress?: (e: any) => void) {
    return doUpload(file, onProgress);
  },

  /** 通用上传，返回 { url, name } 列表 */
  async upload(file: File) {
    const url = await doUpload(file);
    return url ? [{ url, name: file?.name || '' }] : [];
  },
};

export default communityApi;
