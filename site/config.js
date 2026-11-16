// 홈페이지에 들어가는 정보는 전부 이 파일에서 바꿉니다.
// 값이 비어 있으면 해당 자리는 "준비 중"으로 표시됩니다.
window.SITE = {
  brand: "실전 사회성",
  person: "지창훈",
  center: "참사람발달치유센터",
  region: "대구",

  // 문의
  phone: "",            // 예: "053-000-0000"
  kakaoUrl: "",         // 카카오톡 채널 주소
  naverBlogUrl: "",     // 네이버 블로그 주소
  address: "",          // 센터 주소

  // 유튜브
  youtubeUrl: "",        // 채널 주소. 예: "https://www.youtube.com/@채널이름"
  youtubeChannelId: "",  // "UC"로 시작하는 채널 ID. 넣으면 최신 영상 목록이 자동으로 뜹니다.
  youtubeVideoIds: [],   // 고정해서 보여 줄 영상 ID. 예: ["dQw4w9WgXcQ"]

  // 인스타그램
  instagramUrl: "",      // 계정 주소. 예: "https://www.instagram.com/계정이름/"
  instagramPosts: [],    // 보여 줄 게시물·릴스 주소. 예: ["https://www.instagram.com/reel/XXXX/"]

  // 책
  book: {
    title: "",
    subtitle: "",
    description: "",
    buyUrl: "",
    cover: ""            // 표지 이미지 파일 경로. 예: "book-cover.jpg"
  }
};
