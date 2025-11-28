type TestimonialType = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  platform: string;
  text: string;
};

// ...existing code...
export const testimonials: TestimonialType[] = [
  {
    id: 1,
    name: "Alex Chen",
    handle: "@alexchen",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "This product has completely transformed our workflow. We went from spending hours on manual tasks to having everything automated seamlessly. The interface is intuitive and the results speak for themselves.",
  },
  {
    id: 16,
    name: "Linda Zhao",
    handle: "@lindaz",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "I love how simple it is to join a space. No signups, just music! The interface is clean and intuitive, making it easy for everyone to participate, even those who aren't tech-savvy.",
  },
  {
    id: 3,
    name: "Marcus Rodriguez",
    handle: "@marcusr",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face",
    platform: "linkedin",
    text: "The ROI has been incredible. We've saved countless hours and our team productivity has increased dramatically. Best investment we've made this year!",
  },
  {
    id: 4,
    name: "Emma Thompson",
    handle: "@emmathompson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "Simple, elegant, and powerful. The learning curve was minimal, but the impact was massive. Our entire team was up and running in just 15 minutes. The onboarding process was smooth and the documentation is comprehensive.",
  },
  {
    id: 5,
    name: "David Park",
    handle: "@davidpark",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face",
    platform: "linkedin",
    text: "I've tried many solutions in this space, but nothing comes close. The attention to detail and user experience is phenomenal. Highly recommend!",
  },
  {
    id: 6,
    name: "Lisa Wang",
    handle: "@lisawang",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "Game changer! We've been able to scale our operations without hiring additional staff. The analytics dashboard alone is worth the price. The real-time insights have helped us make better decisions and stay ahead of our competition. Customer support is also top-notch - they respond within minutes.",
  },
  {
    id: 7,
    name: "Michael Brown",
    handle: "@mikebrown",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=96&h=96&fit=crop&crop=face",
    platform: "linkedin",
    text: "Incredible value for money. The feature set is comprehensive and the performance is rock solid.",
  },
  {
    id: 8,
    name: "Jennifer Liu",
    handle: "@jenniferliu",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "This tool has revolutionized how we handle our daily operations. The automation features have saved us countless hours each week, and the intuitive interface means our team didn't need extensive training. We're seeing results we never thought possible.",
  },
  // --- Extra varied testimonials below ---
  {
    id: 9,
    name: "Priya Singh",
    handle: "@priyasingh",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=96&h=96&fit=crop&crop=face",
    platform: "instagram",
    text: "MusicSpace made our event unforgettable! Everyone got to add their favorite tracks and the playlist was pure fire. The voting system kept the energy high and the crowd engaged all night long. Highly recommended for any gathering, big or small.",
  },
  {
    id: 10,
    name: "Tom Becker",
    handle: "@tombecker",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=96&h=96&fit=crop&crop=face",
    platform: "facebook",
    text: "The host controls are perfect for keeping the party on track. Highly recommend for any gathering. The flexibility to skip or lock songs ensures the vibe never drops.",
  },
  {
    id: 11,
    name: "Sofia Rossi",
    handle: "@sofiarossi",
    avatar:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=96&h=96&fit=crop&crop=face",
    platform: "instagram",
    text: "We tried MusicSpace at our club meeting and everyone loved it. The upvote/downvote feature is awesome! It's now our go-to for every social event, and the playlist always reflects the group's mood. The collaborative aspect keeps everyone engaged, and the music never gets stale.",
  },
  {
    id: 12,
    name: "Ethan Lee",
    handle: "@ethanlee",
    avatar:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=96&h=96&fit=crop&crop=face",
    platform: "twitter",
    text: "Finally, a way to make group listening fair and fun. No more arguments! Everyone gets a say, and the best tracks always rise to the top.",
  },
  // {
  //   id: 13,
  //   name: "Maya Patel",
  //   handle: "@mayapatel",
  //   avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=96&h=96&fit=crop&crop=face",
  //   platform: "linkedin",
  //   text: "The interface is so clean and easy. We use it every weekend! It's become a staple for our friend group, and we love discovering new music together."
  // },
  // {
  //   id: 14,
  //   name: "Nina Müller",
  //   handle: "@ninam",
  //   avatar: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=96&h=96&fit=crop&crop=face",
  //   platform: "instagram",
  //   text: "Perfect for road trips! Everyone gets a say in the playlist. The collaborative aspect keeps everyone engaged, and the music never gets stale. Highly recommended for any adventure!"
  // },
  // {
  //   id: 15,
  //   name: "Carlos Mendez",
  //   handle: "@carlosm",
  //   avatar: "https://images.unsplash.com/photo-1519340333755-c6e2a6c7b8e8?w=96&h=96&fit=crop&crop=face",
  //   platform: "linkedin",
  //   text: "We used MusicSpace for our office event and it was a hit. Everyone felt included and the playlist was always fresh. The ability to upvote and downvote songs made the experience truly collaborative. Will definitely use again!"
  // },
  // {
  //   id: 16,
  //   name: "Linda Zhao",
  //   handle: "@lindaz",
  //   avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face",
  //   platform: "twitter",
  //   text: "I love how simple it is to join a space. No signups, just music! The interface is clean and intuitive, making it easy for everyone to participate, even those who aren't tech-savvy."
  // }
];
// ...existing code...
