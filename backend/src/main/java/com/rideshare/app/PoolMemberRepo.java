package com.rideshare.app;import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;
public interface PoolMemberRepo extends JpaRepository<PoolMember,Long>{boolean existsByPoolIdAndUserId(Long pool,Long user);List<PoolMember> findByPoolId(Long id);}
