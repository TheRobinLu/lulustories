import { Api } from '@/shared/api';
import { dateConfig } from '@/shared/consts';
import { sanityClient, urlFor } from '@/shared/sanity';
import { IStory, IStorySimple } from '@/shared/story.interface';
import PortableText from 'react-portable-text';

// TODO: change this probably
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { [Api.slug]: string };
}

export async function generateStaticParams() {
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
  return simpleStories.map((simpleStory: IStorySimple) => {
    return { [Api.slug]: simpleStory.slug.current };
  });
}

export default async function Story({ params }: Props) {
  const { slug } = params;
  const story: IStory = await sanityClient.fetch(`*[_type == "story" && slug.current == "${slug}"][0]`);
  const date: string = new Date(story._createdAt).toLocaleString(undefined, dateConfig);
  // Add create table of content
  const chapters: string[] = story.body
    .map((section: any) => {
      if (section.style === 'h1') {
        return section.children[0].text;
      } else {
        return;
      }
    })
    .filter((chapter: string | undefined) => chapter);

  // Put in image groups
  const imageGroupsRefs: string[] = [];
  story.body.forEach((item: any) => {
    if (item._type == 'reference') {
      imageGroupsRefs.push(item._ref);
    }
  });
  const imageGroupAssets: Record<string, Object> = {};
  for (let i = 0; i < imageGroupsRefs.length; i++) {
    const imageQuery = `
      *[_type == 'imageGroups' && _id == $ref][0] {
        body
      }
    `;
    const imageGroups = await sanityClient.fetch(imageQuery, {
      ref: imageGroupsRefs[i],
    });
    imageGroupAssets[imageGroupsRefs[i]] = imageGroups;
  }
  story.body.forEach((item: any) => {
    if (item._type == 'reference') {
      item._type = 'block';
      item.children = [imageGroupAssets[item._ref]];
      item.style = 'imageGroup';
    }
  });
  return (
    <div className='min-h-screen bg-gradient-to-b from-fuchsia-400 via-violet-500 to-purple-200 '>
      <div className='max-w-4xl mx-auto'>
        <div className='flex flex-col h-72 justify-center items-center'>
          <div className='flex-grow flex justify-center items-center'>
            <h1 className='text-6xl'>{story.title}</h1>
          </div>
          <div className='w-full'>
            <p className='mr-8 text-right'>{date}</p>
          </div>
        </div>
        <h2 className='text-2xl text-center'>Table of contents</h2>
        <ul className='flex flex-col gap-2 px-12'>
          {chapters.map((chapter: string) => {
            return (
              <li key={chapter} className='flex flex-row gap-2'>
                <img src='/scroll.png' className='h-6' />
                <a className='text-lg' href={`#${chapter}`}>
                  {chapter}
                </a>
              </li>
            );
          })}
        </ul>
        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={story.body}
          serializers={{
            imageGroup: (props: any) => {
              let imageBody: Object[] = props.children[0].props.node.body;
              return (
                <div className='flex flex-wrap gap-4 md:mx-12'>
                  {imageBody.map((item: any) => {
                    let src: string = '';
                    if (item._type == 'urlObject') {
                      src = item.urlField;
                    } else if (item._type == 'image') {
                      src = urlFor(item.asset).url();
                    }
                    return (
                      <img
                        key={item._key}
                        className='max-h-64 mx-auto object-contain hover:scale-125 transition-transform duration-200 ease-in-out'
                        src={src}
                      />
                    );
                  })}
                </div>
              );
            },
            image: (props: any) => (
              <img className='w-full max-h-[32rem] object-contain py-5' src={urlFor(props.asset).url()} />
            ),
            normal: (props: any) => <p className='text-base md:text-xl my-1 break-words indent-8' {...props} />,
            h1: (props: any) => {
              return (
                <div>
                  <div id={props.children[0]} style={{ paddingTop: '5rem', marginTop: '-5rem' }}></div>
                  <h1 className='text-4xl font-bold my-5' {...props} />
                </div>
              );
            },
            h2: (props: any) => <h2 className='text-2xl font-bold my-3' {...props} />,
            h3: (props: any) => (
              <h3 className='text-lg md:text-xl font-bold my-1 text-gray-600 dark:text-gray-400' {...props} />
            ),
            li: ({ children }: any) => <li className='ml-16 list-disc'> {children} </li>,
            link: ({ href, children }: any) => (
              <a href={href} className='text-blue-500 hover:underline'>
                {children}
              </a>
            ),
          }}
        />
      </div>
    </div>
  );
}
