export interface IStorySimple {
  _id: string;
  _createdAt: Date;
  slug: {
    current: string;
  };
  title: string;
}

export interface IStory {
  _id: string;
  _createdAt: string;
  title: string;
  description: string;
  slug: {
    current: string;
  };
  body: object[];
}
