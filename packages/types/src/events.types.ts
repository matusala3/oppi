type EventMetadata = {
  eventId: string
  version: string
  producedBy: string
}

export type UserRegisteredEvent = {
  eventType: 'user.registered'
  payload: {
    userId: string
    email: string
    registeredAt: string
  }
  metadata: EventMetadata
}

export type UserProfileUpdatedEvent = {
  eventType: 'user.profile_updated'
  payload: {
    userId: string
    changedFields: string[]
    updatedAt: string
  }
  metadata: EventMetadata
}

export type CourseLessonCompletedEvent = {
  eventType: 'course.lesson_completed'
  payload: {
    userId: string
    courseId: string
    lessonId: string
    score: number
    completedAt: string
  }
  metadata: EventMetadata
}

export type CourseModuleCompletedEvent = {
  eventType: 'course.module_completed'
  payload: {
    userId: string
    courseId: string
    moduleId: string
    completedAt: string
  }
  metadata: EventMetadata
}

export type GamificationXpAwardedEvent = {
  eventType: 'gamification.xp_awarded'
  payload: {
    userId: string
    xpAmount: number
    reason: string
    totalXp: number
    awardedAt: string
  }
  metadata: EventMetadata
}

export type GamificationAchievementUnlockedEvent = {
  eventType: 'gamification.achievement_unlocked'
  payload: {
    userId: string
    achievementId: string
    achievementName: string
    unlockedAt: string
  }
  metadata: EventMetadata
}

export type GamificationLevelUpEvent = {
  eventType: 'gamification.level_up'
  payload: {
    userId: string
    previousLevel: number
    newLevel: number
    leveledUpAt: string
  }
  metadata: EventMetadata
}

export type OppiEvent =
  | UserRegisteredEvent
  | UserProfileUpdatedEvent
  | CourseLessonCompletedEvent
  | CourseModuleCompletedEvent
  | GamificationXpAwardedEvent
  | GamificationAchievementUnlockedEvent
  | GamificationLevelUpEvent
