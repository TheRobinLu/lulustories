import { Api } from '@/shared/api';
import { dateConfig } from '@/shared/consts';
import { sanityClient } from '@/shared/sanity';
import { IStorySimple } from '@/shared/story.interface';
import Link from 'next/link';

// TODO: change this probably
export const revalidate: number = 3600;

export default async function Home() {
  const simpleStories: IStorySimple[] = await sanityClient.fetch(`
    *[_type == "story"] {
      _id,
      _createdAt,
      slug {
        current
      },
      title,
    }
  `);
  return (
    <>
      <div className='min-h-screen bg-purple-200'>
        <div>
          <div className='h-96 bg-gradient-to-t from-sky-400 to-fuchsia-400 flex flex-col justify-center items-center gap-3'>
            <h1 className='text-6xl text-purple-200'>{`Welcome to`}</h1>
            <h1 className='text-6xl text-sky-100'>{`Zihan's stories`}</h1>
            <h2 className='text-gray-200'>Designed by Tom</h2>
          </div>
        </div>
        <main className='flex max-w-4xl mx-auto'>
          <div className='flex flex-col gap-2'>
            {simpleStories.map((simpleStory: IStorySimple, index: number) => {
              return (
                <Link key={`${index}-${simpleStory.slug.current}`} href={`/${Api.story}/${simpleStory.slug.current}`}>
                  <div className='d-flex flex-col gap-1 p-2 border rounded-lg border-white shadow'>
                    <p>{simpleStory.title}</p>
                    <p className='text-xs text-gray-500'>
                      {new Date(simpleStory._createdAt).toLocaleString(undefined, dateConfig)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
