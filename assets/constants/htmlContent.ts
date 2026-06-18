export const localHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Course Player</title>
      <style>
        * {
          margin: 0;
          padding: 1px;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #1e293b;
          min-height: 100vh;
          padding: 0;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          padding: 40px 24px 32px;
          border-radius: 0 0 32px 32px;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .category-badge {
          display: inline-block;
          background-color: rgba(255, 255, 255, 0.25);
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 12px;
          word-wrap: break-word;
        }

        .hero-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          opacity: 0.95;
        }

        /* Course Meta */
        .course-meta {
          display: flex;
          gap: 20px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
        }

        .meta-value {
          font-size: 16px;
          font-weight: 700;
        }

        /* Main Content */
        .content {
          padding: 0 24px;
        }

        /* Instructor Card */
        .instructor-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .instructor {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .instructor-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          flex-shrink: 0;
        }

        .instructor-info {
          flex: 1;
        }

        .instructor-name {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          display: block;
        }

        .instructor-title {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        /* Description Section */
        .description-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin: 0 0 24px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .description-text {
          font-size: 15px;
          line-height: 1.7;
          color: #475569;
        }

        /* Features/Highlights */
        .features-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin: 0 0 24px 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .feature-icon {
          color: #3b82f6;
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-text {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
        }

        /* Assignment Section */
        .assignment-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
          border-radius: 20px;
          padding: 28px;
          margin: 0 0 24px 0;
          border: 2px solid #e0e7ff;
          position: relative;
          overflow: hidden;
        }

        .assignment-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 250px;
          height: 250px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
        }

        .assignment-content {
          position: relative;
          z-index: 1;
        }

        .assignment-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .assignment-description {
          font-size: 14px;
          color: #475569;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* Progress Bar */
        .progress-container {
          margin-bottom: 20px;
        }

        .progress-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          width: 75%;
          transition: width 0.3s ease;
        }

        /* Buttons */
        .btn-container {
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-sizing: border-box;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:active {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .btn-primary:disabled {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          opacity: 1;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #3b82f6;
          border: 2px solid #e0e7ff;
        }

        .btn-secondary:active {
          background: #f8fafc;
        }

        /* Completed Banner */
        .completed-banner {
          display: none;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #6ee7b7;
          color: #065f46;
          padding: 16px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 20px;
          animation: slideDown 0.4s ease;
        }

        .completed-banner.show {
          display: block;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .completed-icon {
          display: inline-block;
          margin-right: 8px;
        }

        /* Spacing utilities */
        .mt-4 { margin-top: 16px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }

        /* Responsive */
        @media (max-width: 480px) {
          .hero {
            padding: 32px 20px 24px;
          }
          
          .hero-title {
            font-size: 24px;
          }

          .content {
            padding: 0 16px;
          }

          .course-meta {
            gap: 16px;
            margin-top: 20px;
          }

          .btn-container {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <div class="hero">
        <div class="hero-content">
          <span class="category-badge" id="category">Premium</span>
          <h1 class="hero-title" id="title">Course Title</h1>
          <p class="hero-subtitle" id="description">Course description loading...</p>
          
          <div class="course-meta">
            <div class="meta-item">
              <span class="meta-label">Duration</span>
              <span class="meta-value">8 weeks</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Level</span>
              <span class="meta-value">Intermediate</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Rating</span>
              <span class="meta-value">★ 4.8</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <!-- Completed Banner -->
        <div id="completed-banner" class="completed-banner">
          <span class="completed-icon">✓</span>
          Congratulations! Course Completed
        </div>

        <!-- Instructor Section -->
        <div class="instructor-section">
          <div class="section-label">👨‍🏫 Instructor</div>
          <div class="instructor">
            <img id="instructor-avatar" class="instructor-avatar" src="" alt="Instructor" />
            <div class="instructor-info">
              <span class="instructor-name" id="instructor-name">Instructor Name</span>
              <span class="instructor-title">Expert Educator</span>
            </div>
          </div>
        </div>

        <!-- What You'll Learn -->
        <div class="features-section">
          <h3 class="section-title">
            <span>📚</span> What You'll Learn
          </h3>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Master core concepts and fundamentals</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Build real-world projects from scratch</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Receive personalized feedback</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">Earn a certificate of completion</span>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="description-section">
          <h3 class="section-title">
            <span>📖</span> Course Overview
          </h3>
          <p class="description-text" id="full-description">This comprehensive course is designed to take you from beginner to intermediate level. You'll learn industry best practices and practical skills that you can apply immediately.</p>
        </div>

        <!-- Assignment/Completion Section -->
        <div class="assignment-section">
          <div class="assignment-content">
            <div class="progress-container">
              <div class="progress-label">
                <span>Your Progress</span>
                <span id="progress-percent">0%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
            </div>

            <h3 class="assignment-title">
              <span>🎯</span> Complete Your Learning Journey
            </h3>
            <p class="assignment-description">
              You've made excellent progress! Mark this course as complete to earn your certificate and unlock exclusive resources.
            </p>

            <div class="btn-container">
              <button class="btn btn-primary" id="complete-btn" onclick="completeCourse()">
                <span>📝</span> Mark as Completed
              </button>
            </div>
          </div>
        </div>

        <div style="height: 40px;"></div>
      </div>

      <script>
        function setupCourseData(course) {
          document.getElementById('title').innerText = course.title;
          document.getElementById('category').innerText = course.category || 'Premium';
          document.getElementById('description').innerText = course.description || '';
          document.getElementById('full-description').innerText = course.description || '';
          document.getElementById('instructor-name').innerText = course.instructor?.name || 'Expert Educator';
          
          const avatar = document.getElementById('instructor-avatar');
          if (course.instructor?.avatar) {
            avatar.src = course.instructor.avatar;
          } else {
            avatar.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
          }

          // Set up progress
          const progressPercent = course.isCompleted ? 100 : 75;
          document.getElementById('progress-percent').innerText = progressPercent + '%';
          document.querySelector('.progress-fill').style.width = progressPercent + '%';
          
          if (course.isCompleted) {
            setCompletedUI();
          }
        }

        function setCompletedUI() {
          document.getElementById('completed-banner').classList.add('show');
          const btn = document.getElementById('complete-btn');
          btn.innerText = '✓ Course Completed';
          btn.disabled = true;
          btn.className = 'btn btn-primary';
        }

        function completeCourse() {
          if (window.ReactNativeWebView) {
            const message = JSON.stringify({
              type: 'COMPLETE_COURSE',
              courseId: window.courseId
            });
            window.ReactNativeWebView.postMessage(message);
          }
        }
      </script>
    </body>
    </html>
  `;