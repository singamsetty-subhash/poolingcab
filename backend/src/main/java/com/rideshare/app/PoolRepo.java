package com.rideshare.app;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface PoolRepo extends JpaRepository<PoolRequest,Long>{List<PoolRequest> findByStatusIn(Collection<String> statuses);}
