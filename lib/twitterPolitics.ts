export interface TwitterPoliticsItem {
  id: string;
  title: string;
  url: string;
  authorName: string;
  username: string;
  time: string;
  metrics: {
    likes: number;
    reposts: number;
    replies: number;
  };
}

interface XPost {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
  };
}

interface XUser {
  id: string;
  name: string;
  username: string;
}

interface XSearchResponse {
  data?: XPost[];
  includes?: {
    users?: XUser[];
  };
}

const DEFAULT_QUERY = '(УИХ OR "Засгийн газар" OR Ерөнхийлөгч OR сонгууль OR "улс төр" OR нам OR сайд) -is:retweet -is:reply';
const SEARCH_URL = 'https://api.x.com/2/tweets/search/recent';
const TOKEN_PLACEHOLDERS = new Set(['', 'YOUR_X_API_BEARER_TOKEN', 'YOUR_TWITTER_BEARER_TOKEN']);

const stripUrls = (text: string) => text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();

export const getTwitterBearerToken = () => {
  const token = (process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || '').trim();
  return TOKEN_PLACEHOLDERS.has(token) ? '' : token;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return 'саяхан';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} минутын өмнө`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  return `${Math.floor(hours / 24)} өдрийн өмнө`;
};

export async function getTwitterPoliticsHighlights(): Promise<TwitterPoliticsItem[]> {
  const bearerToken = getTwitterBearerToken();
  if (!bearerToken) return [];

  const params = new URLSearchParams({
    query: process.env.TWITTER_POLITICS_QUERY || DEFAULT_QUERY,
    max_results: '20',
    sort_order: 'recency',
    expansions: 'author_id',
    'tweet.fields': 'created_at,author_id,public_metrics,lang',
    'user.fields': 'name,username,verified',
  });

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X API request failed: ${response.status}`);
  }

  const json = (await response.json()) as XSearchResponse;
  const users = new Map((json.includes?.users || []).map(user => [user.id, user]));

  return (json.data || [])
    .map(post => {
      const user = post.author_id ? users.get(post.author_id) : undefined;
      const username = user?.username || 'x';
      return {
        id: post.id,
        title: stripUrls(post.text),
        url: `https://x.com/${username}/status/${post.id}`,
        authorName: user?.name || username,
        username,
        time: formatRelativeTime(post.created_at),
        metrics: {
          likes: post.public_metrics?.like_count || 0,
          reposts: post.public_metrics?.retweet_count || 0,
          replies: post.public_metrics?.reply_count || 0,
        },
      };
    })
    .filter(item => item.title.length > 0)
    .slice(0, 6);
}
