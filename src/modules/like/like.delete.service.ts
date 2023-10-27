import { ILikeRepository } from './repositories/ILikeRepository'

type LikeDeleteRequest = {
  likeId: string
  userId: string
}

class LikeDeleteService {
  constructor(private likeRepository: ILikeRepository) {}

  async execute(data: LikeDeleteRequest) {
    const { likeId, userId } = data

    const like = await this.likeRepository.findById(likeId)

    if (!like) {
      throw new Error('Like not found.')
    }

    if (like.userId !== userId) {
      throw new Error('User is not authorized to delete this like.')
    }

    await this.likeRepository.delete(like.id)

    return
  }
}

export { LikeDeleteService }
